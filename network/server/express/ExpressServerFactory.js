var _ = require('lodash');
var bodyParser = require('body-parser');
var Class = require('class.extend');
var express = require('express');
var http = require('http');
var https = require('https');
var log4js = require('log4js');
var socketIO = require('socket.io');
var when = require('when');

var Disposable = require('common/lang/Disposable');
var DisposableStack = require('common/collections/specialized/DisposableStack');
var CommandHandler = require('common/commands/CommandHandler');
var assert = require('common/lang/assert');

var Container = require('./../endpoints/Container');
var RestContainer = require('./../endpoints/rest/RestContainer');
var ServerFactory = require('./../ServerFactory');
var SocketContainer = require('./../endpoints/socket.io/SocketContainer');
var Verb = require('./../../http/Verb');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('common-node/network/server/express/ExpressServerFactory');

    var ExpressServerFactory = ServerFactory.extend({
        init: function() {

        },
        
        _build: function(containers) {
            var serverContainer = new ExpressServerContainer();
            var containerBindingStrategies = ContainerBindingStrategy.getStrategies();

            return when.map(containers, function(container) {
                var containerBindingStrategy = _.find(containerBindingStrategies, function(candidate) {
                    return candidate.canBind(container);
                });

                var bindingPromise;

                if (containerBindingStrategy) {
                    bindingPromise = containerBindingStrategy.bind(container, serverContainer);
                } else {
                    logger.warn('Unable to find appropriate binding strategy for container');

                    bindingPromise = when(null);
                }

                return bindingPromise;
            }).then(function(ignored) {
                return serverContainer.start();
            });
        },

        toString: function() {
            return '[ExpressServerFactory]';
        }
    });

    var ExpressServer = Class.extend({
        init: function(port, secure) {
            assert.argumentIsRequired(port, 'port', Number);
            assert.argumentIsRequired(secure, 'secure', Boolean);

            this._port = port;
            this._secure = secure;

            this._routeMap = { };
			this._socketMap = { };

            this._started = false;
        },

        getPort: function() {
            return this._port;
        },

        getIsSecure: function() {
            return this._secure;
        },

        addRoute: function(basePath, routePath, verb, command) {
            assert.argumentIsRequired(basePath, 'basePath', String);
            assert.argumentIsRequired(routePath, 'routePath', String);
            assert.argumentIsRequired(verb, 'verb', Verb, 'Verb');
            assert.argumentIsRequired(command, 'command', CommandHandler, 'CommandHandler');

            if (this._started) {
                throw new Error('Unable to add route, the server has already been started.');
            }

            if (!_.has(this._routeMap, basePath)) {
                this._routeMap[basePath] = {
                    path: basePath,
                    handlers: [ ]
                };
            }

            var handlerData = {
                verb: verb,
                path: routePath,
                handler: buildRequestHandler(verb, basePath, routePath, command)
            };

            this._routeMap[basePath].handlers.push(handlerData);
        },

        addChannel: function(path, channel, command) {
			assert.argumentIsRequired(path, 'path', String);
			assert.argumentIsRequired(channel, 'channel', String);
			assert.argumentIsRequired(command, 'command', CommandHandler, 'CommandHandler');

            if (this._started) {
                throw new Error('Unable to add handler for socket.io channel, the server has already been started.');
            }

			var completePath = path + channel;

			if (_.has(this._socketMap, completePath)) {
				throw new Error('Unable to add handler for socket.io channel, another handler is already using this channel.');
			}

			this._socketMap[completePath] = command;
        },
        
        start: function() {
            if (this._started) {
                throw new Error('Unable to start server, the has already been started.');
            }

            this._started = true;

            var secure = this.getIsSecure();
            var port = this.getPort();

            var app = new express();

            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json());

            app.use(function(req, res, next) {
                logger.debug('Applying HTTP headers for ' + req.originalUrl);

                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPTIONS');

                next();
            });

			if (_.some(this._routeMap)) {
				var routeBindingStrategies = ExpressRouteBindingStrategy.getStrategies();

				_.forEach(this._routeMap, function (routeData) {
					var basePath = routeData.path;
					var router = express.Router();

					_.forEach(routeData.handlers, function (handlerData) {
						var verb = handlerData.verb;
						var handler = handlerData.handler;
						var routePath = handlerData.path;

						var routeBindingStrategy = _.find(routeBindingStrategies, function(candidate) {
							return candidate.canBind(verb);
						});

						if (routeBindingStrategy) {
							routeBindingStrategy.bind(router, verb, routePath, handler);

							logger.info('Bound handler for', (secure ? 'HTTPS' : 'HTTP'), verb.getCode(), 'on port', port, 'at', basePath + routePath);
						} else {
							logger.warn('Unable to find appropriate binding strategy for endpoint using HTTP verb (' + verb.getCode() + ')');
						}
					});

					app.use(basePath, router);
				});
			}

			var server;

			if (secure) {
				server = https.createServer(app);
			} else {
				server = http.createServer(app);
			}

			if (_.some(this._socketMap)) {
				var io = socketIO.listen(server);

				_.forEach(this._socketMap, function(command, channel) {
					logger.info('Socket.IO handler on port', port, 'will respond to channel', channel);
				});

				io.on('connection', function(socket) {
					logger.info('Socket.io client [', socket.id, '] at', socket.conn.remoteAddress, 'connected on port', port);
					logger.info('Socket.io now has', _.size(socket.adapter.sids), 'connections');

					socket.on('disconnect', function() {
						logger.info('Socket.io client [', socket.id, '] at', socket.conn.remoteAddress, 'on port', port, 'disconnected');
						logger.info('Socket.io now has', +_.size(socket.adapter.sids), 'connections');
					});

					_.forEach(this._socketMap, function(command, channel) {
						socket.on(channel, buildChannelHandler(name, channel, command, socket));
					});

					logger.info('Socket.io client [', socket.id, '] at', socket.conn.remoteAddress, 'on port', port, 'is ready to accept messages');
				});
			}

            server.listen(port);

            return new Disposable.fromAction(function() {
                server.close();
            });
        }
    });

    var ExpressServerContainer = Class.extend({
        init: function() {
            this._serverMap = { };

            this._started = false;
        },

        getServer: function(port, secure) {
            if (this._started) {
                throw new Error('Unable to manipulate servers, the server container has already started.');
            }

            if (!_.has(this._serverMap, port)) {
                this._serverMap[port] = new ExpressServer(port, secure);
            }

            var returnRef = this._serverMap[port];

            if (returnRef.getIsSecure() !== secure) {
                throw new Error('Unable to bind HTTP and HTTPS protocol to the same port (' + port + ').');
            }

            return returnRef;
        },

        start: function() {
            if (this._started) {
                throw new Error('Unable to start servers, the server container has already started.');
            }

            this._started = true;


            return when.map(_.values(this._serverMap), function(server) {
                logger.info('Starting new ' + (server.getIsSecure() ? 'secure ' : '') + 'server on port ' + server.getPort());

                return server.start();
            }).then(function(disposables) {
                return _.reduce(disposables, function(stack, disposable) {
                    stack.push(disposable);

                    return stack;
                }, new DisposableStack());
            });
        }
    });

    var ExpressRouteBindingStrategy = Class.extend({
        init: function(verb, action) {
            assert.argumentIsRequired(verb, 'verb', Verb, 'Verb');
            assert.argumentIsRequired(action, 'action', Function);

            this._verb = verb;
            this._action = action;
        },

        canBind: function(verb) {
            return this._verb === verb;
        },

        bind: function(router, verb, path, handler) {
            assert.argumentIsRequired(router, router);
            assert.argumentIsRequired(verb, 'verb', Verb, 'Verb');
            assert.argumentIsRequired(path, 'path', String);
            assert.argumentIsRequired(handler, 'handler', Function);

            if (!this.canBind(verb)) {
                logger.warn('Unable to bind endpoint. The strategy does not support the HTTP verb (' + verb.getCode() + ')');
            }

            return this._action(router, path, handler);
        }
    });

    ExpressRouteBindingStrategy.getStrategies = function() {
        return [
            new ExpressRouteBindingStrategy(Verb.GET, function(router, path, handler) {
                router.get(path, handler);
            }),
            new ExpressRouteBindingStrategy(Verb.POST, function(router, path, handler) {
                router.post(path, handler);
            }),
            new ExpressRouteBindingStrategy(Verb.PUT, function(router, path, handler) {
                router.put(path, handler);
            }),
            new ExpressRouteBindingStrategy(Verb.DELETE, function(router, path, handler) {
                router.delete(path, handler);
            })
        ];
    };

    var ExpressArgumentExtractionStrategy = Class.extend({
        init: function(verb, action) {
            assert.argumentIsRequired(verb, 'verb', Verb, 'Verb');
            assert.argumentIsRequired(action, 'action', Function);

            this._verb = verb;
            this._action = action;
        },

        canProcess: function(verb) {
            return this._verb === verb;
        },

        getCommandArguments: function(verb, request) {
            assert.argumentIsRequired(request, 'request');

            if (!this.canProcess(verb)) {
                logger.warn('Unable to extract arguments from HTTP request.');
            }

            return this._action(request);
        }
    });

    ExpressArgumentExtractionStrategy.getStrategies = function() {
        return [
            new ExpressArgumentExtractionStrategy(Verb.GET, function(req) {
                return _.merge(req.query || { }, req.params || { });
            }),
            new ExpressArgumentExtractionStrategy(Verb.POST, function(req) {
                return _.merge(req.params || { }, req.body || { });
            }),
            new ExpressArgumentExtractionStrategy(Verb.PUT, function(req) {
                return _.merge(req.params || { }, req.body || { });
            }),
            new ExpressArgumentExtractionStrategy(Verb.DELETE, function(req) {
                return _.merge(req.query || { }, req.params || { });
            })
        ];
    };

    var ContainerBindingStrategy = Class.extend({
        init: function() {

        },

        canBind: function(container) {
            return this._canBind(container);
        },

        _canBind: function(container) {
            return false;
        },

        bind: function(container, serverContainer) {
            assert.argumentIsRequired(container, 'container', Container, 'Container');
            assert.argumentIsRequired(serverContainer, 'serverContainer', ExpressServerContainer, 'ExpressServerContainer');

            if (!this.canBind(container)) {
                throw new Error('Unable to bind container, the strategy does not support the container.');
            }

            return when(this._bind(container, serverContainer));
        },

        _bind: function(container, serverContainer) {
            return false;
        }
    });

    var RestContainerBindingStrategy = ContainerBindingStrategy.extend({
        init: function() {
            this._super();
        },

        _canBind: function(container) {
            return container instanceof RestContainer;
        },

        _bind: function(container, serverContainer) {
            var endpoints = container.getEndpoints();

            var server = serverContainer.getServer(container.getPort(), container.getIsSecure());

            _.forEach(endpoints, function(endpoint) {
                server.addRoute(container.getPath(), endpoint.getPath(), endpoint.getRestAction().getVerb(), endpoint.getCommand());
            });

            return true;
        }
    });

    var SocketContainerBindingStrategy = ContainerBindingStrategy.extend({
        init: function() {
            this._super();
        },

        _canBind: function(container) {
            return container instanceof SocketContainer;
        },

        _bind: function(container, serverContainer) {
			var endpoints = container.getEndpoints();

			var server = serverContainer.getServer(container.getPort(), container.getIsSecure());

			_.forEach(endpoints, function(endpoint) {
				server.addChannel(container.getPath(), endpoint.getChannel(), endpoint.getCommand());
			});

			return true;
        }
    });

    ContainerBindingStrategy.getStrategies = function() {
        return [
            new RestContainerBindingStrategy(),
            new SocketContainerBindingStrategy()
        ];
    };

    function buildRequestHandler(verb, basePath, routePath, command) {
        var sequencer = 0;

        var argumentExtractionStrategy = _.find(ExpressArgumentExtractionStrategy.getStrategies(), function(candidate) {
            return candidate.canProcess(verb);
        });

        if (!argumentExtractionStrategy) {
            logger.warn('Unable to find appropriate argument extraction strategy for HTTP ' + verb.getCode() + ' requests');

            argumentExtractionStrategy = function() {
                return { };
            };
        }

        return function(request, response) {
            var sequence = sequencer++;

            logger.debug('Processing starting for', verb.getCode(), 'at', basePath + routePath, '(' + sequence + ')');

            return when.try(function() {
                logger.debug('Processing completed for', verb.getCode(), 'at', basePath + routePath, '(' + sequence + ')');

                return command.process(argumentExtractionStrategy.getCommandArguments(verb, request));
            }).then(function(result) {
                if (_.isObject(result) || _.isArray(result)) {
                    response.json(result);
                } else if (verb === Verb.GET && (_.isNull(result) || _.isUndefined(result))) {
                    response.status(404);
                    response.json(generateResponse('no data'));
                } else {
                    response.status(200);
                    response.json(generateResponse('success'));
                }
            }).catch(function(error) {
                logger.error(error);

                response.status(500);
                response.json(generateResponse(error.message || error.toString() || 'internal server error'));
            });
        };
    }

	function buildChannelHandler(namespace, channel, command, socket) {
		return function(socket) {

		};
	}

    function generateResponse(message) {
        return {
            message: message
        };
    }

    return ExpressServerFactory;
}();