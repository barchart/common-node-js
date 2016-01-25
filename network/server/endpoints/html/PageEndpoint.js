var assert = require('common/lang/assert');
var CommandHandler = require('common/commands/CommandHandler');

var Endpoint = require('./../Endpoint');
var Verb = require('./../../../http/Verb');

module.exports = function() {
	'use strict';

	var PageEndpoint = Endpoint.extend({
		init: function(verb, path, template, command) {
			this._super(command || emptyCommand);

			assert.argumentIsRequired(verb, 'verb', Verb, 'Verb');
			assert.argumentIsRequired(path, 'path', String);
			assert.argumentIsRequired(template, 'template', String);

			this._verb = verb;
			this._path = path;
			this._template = template;
		},

		getVerb: function() {
			return this._verb;
		},

		getPath: function() {
			return this._path;
		},

		getTemplate: function() {
			return this._template;
		},

		toString: function() {
			return '[PageEndpoint]';
		}
	});

	var emptyCommand = CommandHandler.fromFunction(function(ignored) {
		return { };
	});

	return PageEndpoint;
}();