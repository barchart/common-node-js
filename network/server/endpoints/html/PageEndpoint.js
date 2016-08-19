var assert = require('common/lang/assert');
var CommandHandler = require('common/commands/CommandHandler');

var Endpoint = require('./../Endpoint');
var Verb = require('./../../../http/Verb');

module.exports = (() => {
	'use strict';

	const emptyCommand = CommandHandler.fromFunction((ignored) => {
		return {};
	});

	class PageEndpoint extends Endpoint {
		constructor(verb, path, template, command, cache, acceptFile, secureRedirect) {
			super(command || emptyCommand);

			assert.argumentIsRequired(verb, 'verb', Verb, 'Verb');
			assert.argumentIsRequired(path, 'path', String);
			assert.argumentIsRequired(template, 'template', String);
			assert.argumentIsOptional(cache, 'cache', Boolean);
			assert.argumentIsOptional(acceptFile, 'acceptFile', Boolean);
			assert.argumentIsOptional(secureRedirect, 'secureRedirect', Boolean);

			this._verb = verb;
			this._path = path;
			this._template = template;
			this._cache = cache || false;
			this._acceptFile = acceptFile || false;
			this._secureRedirect = secureRedirect || false;
		}

		getVerb() {
			return this._verb;
		}

		getPath() {
			return this._path;
		}

		getTemplate() {
			return this._template;
		}

		getCache() {
			return this._cache;
		}

		getAcceptFile() {
			return this._acceptFile;
		}

		getSecureRedirect() {
			return this._secureRedirect;
		}

		toString() {
			return '[PageEndpoint]';
		}
	}

	return PageEndpoint;
})();