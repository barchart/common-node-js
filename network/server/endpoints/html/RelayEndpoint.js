var assert = require('common/lang/assert');
var CommandHandler = require('common/commands/CommandHandler');

var Endpoint = require('./../Endpoint');
var Verb = require('./../../../http/Verb');

module.exports = function() {
	'use strict';

	var RelayEndpoint = Endpoint.extend({
		init: function(verb, acceptPath, forwardHost, forwardPath, headerOverrides, parameterOverrides) {
			this._super(emptyCommand);

			assert.argumentIsRequired(verb, 'verb', Verb, 'Verb');
			assert.argumentIsRequired(acceptPath, 'acceptPath', String);
			assert.argumentIsRequired(forwardHost, 'forwardHost', String);
			assert.argumentIsRequired(forwardPath, 'forwardPath', String);
			assert.argumentIsOptional(headerOverrides, 'headerOverrides', Object);
			assert.argumentIsOptional(parameterOverrides, 'parameterOverrides', Object);

			this._verb = verb;

			this._acceptPath = acceptPath;

			this._forwardHost = forwardHost;
			this._forwardPath = forwardPath;

			this._headerOverrides = headerOverrides || { };
			this._parameterOverrides = parameterOverrides || { };
		},

		getVerb: function() {
			return this._verb;
		},

		getAcceptPath: function() {
			return this._acceptPath;
		},

		getForwardHost: function() {
			return this._forwardHost;
		},

		getForwardPath: function() {
			return this._forwardPath;
		},

		getHeaderOverrides: function() {
			return this._headerOverrides;
		},

		getParameterOverrides: function() {
			return this._parameterOverrides;
		},

		toString: function() {
			return '[RelayEndpoint]';
		}
	});

	var emptyCommand = CommandHandler.fromFunction(function(ignored) {
		return {};
	});

	return RelayEndpoint;
}();