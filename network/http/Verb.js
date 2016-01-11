var Class = require('class.extend');

var assert = require('common/lang/assert');

module.exports = function() {
	'use strict';

	var Verb = Class.extend({
		init: function(code) {
			assert.argumentIsRequired(code, 'code', String);

			this._code = code;
		},

		getCode: function() {
			return this._code;
		},

		toString: function() {
			return '[Verb (code=' + this._code + ')]';
		}
	});

	function addVerb(verb) {
		var code = verb.getCode();

		Verb[code] = verb;
	}

	addVerb(new Verb('POST'));
	addVerb(new Verb('GET'));
	addVerb(new Verb('PUT'));
	addVerb(new Verb('DELETE'));
	addVerb(new Verb('OPTIONS'));

	return Verb;
}();