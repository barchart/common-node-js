const assert = require('common/lang/assert');

const Endpoint = require('./../Endpoint'),
	RestAction = require('./RestAction');

module.exports = (() => {
	'use strict';

	class RestEndpoint extends Endpoint {
		constructor(action, path, command) {
			super(command);

			assert.argumentIsRequired(action, 'action', RestAction, 'RestAction');
			assert.argumentIsRequired(path, 'path', String);

			this._action = action;
			this._path = path;
		}

		getRestAction() {
			return this._action;
		}

		getPath() {
			return this._path;
		}

		toString() {
			return '[RestEndpoint]';
		}
	}

	return RestEndpoint;
})();