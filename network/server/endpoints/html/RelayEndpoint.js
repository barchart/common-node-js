var assert = require('common/lang/assert');
var CommandHandler = require('common/commands/CommandHandler');

var Endpoint = require('./../Endpoint');
var Verb = require('./../../../http/Verb');

module.exports = (() => {
	'use strict';

	const emptyCommand = CommandHandler.fromFunction((ignored) => {
		return {};
	});

	class RelayEndpoint extends Endpoint {
		constructor(verb, acceptPath, forwardHost, forwardPath, headerOverrides, parameterOverrides) {
			super(emptyCommand);

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
		}

		getVerb() {
			return this._verb;
		}

		getAcceptPath() {
			return this._acceptPath;
		}

		getForwardHost() {
			return this._forwardHost;
		}

		getForwardPath() {
			return this._forwardPath;
		}

		getHeaderOverrides() {
			return this._headerOverrides;
		}

		getParameterOverrides() {
			return this._parameterOverrides;
		}

		toString() {
			return '[RelayEndpoint]';
		}
	}

	return RelayEndpoint;
})();