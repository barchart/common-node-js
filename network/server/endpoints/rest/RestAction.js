var Class = require('class.extend');

var assert = require('common/lang/assert');

var Verb = require('./../../../http/Verb');

module.exports = function() {
	'use strict';

	var RestAction = Class.extend({
		init: function(description, verb) {
			assert.argumentIsRequired(description, 'description', String);
			assert.argumentIsRequired(verb, 'verb', Verb, 'Verb');

			this._description = description;
			this._verb = verb;
		},

		getDescription: function() {
			return this._description;
		},

		getVerb: function() {
			return this._verb;
		},

		toString: function() {
			return '[RestAction (verb=' + this._verb + ')]';
		}
	});

	function addRestAction(action) {
		var description = action.getDescription();

		RestAction[description] = action;
	}

	addRestAction(new RestAction('Create', Verb.POST));
	addRestAction(new RestAction('Retrieve', Verb.GET));
	addRestAction(new RestAction('Update', Verb.PUT));
	addRestAction(new RestAction('Delete', Verb.DELETE));
	addRestAction(new RestAction('Query', Verb.GET));

	return RestAction;
}();