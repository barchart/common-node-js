var Class = require('class.extend');

var assert = require('common/lang/assert');

module.exports = function() {
	'use strict';

	var Protocol = Class.extend({
		init: function(code, standard, secure) {
			assert.argumentIsRequired(description, 'description', String);
			assert.argumentIsRequired(standard, 'standard', String);
			assert.argumentIsRequired(secure, 'secure', String);

			this._description = description;

			this._standard = standard;
			this._secure = secure;
		},

		getDescription: function() {
			return this._description;
		},

		getStandard: function() {
			return this._standard;
		},

		getSecure: function() {
			return this._secure;
		},

		getUrlPrefix: function(secure) {
			var prefix;

			if (secure) {
				prefix = this._secure;
			} else {
				prefix = this._standard;
			}

			return prefix + '://';
		},
		
		toString: function() {
			return '[Protocol (description=' + this._description + ')]';
		}
	});

	function addProtocol(verb) {
		var code = verb.getCode();

		Protocol[code] = verb;
	}

	addProtocol(new Protocol('HyperText', 'http', 'https'));

	return Protocol;
}();