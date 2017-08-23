const assert = require('@barchart/common-js/lang/assert');

module.exports = (() => {
	'use strict';

	class Verb {
		constructor(code) {
			assert.argumentIsRequired(code, 'code', String);

			this._code = code;
		}

		getCode() {
			return this._code;
		}

		toString() {
			return '[Verb (code=' + this._code + ')]';
		}
	}

	function addVerb(verb) {
		const code = verb.getCode();

		Verb[code] = verb;
	}

	addVerb(new Verb('POST'));
	addVerb(new Verb('GET'));
	addVerb(new Verb('PUT'));
	addVerb(new Verb('DELETE'));
	addVerb(new Verb('OPTIONS'));

	return Verb;
})();