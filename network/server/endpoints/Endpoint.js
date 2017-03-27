const log4js = require('log4js');

const assert = require('common/lang/assert'),
	CommandHandler = require('common/commands/CommandHandler');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/network/server/endpoints/Endpoint');

	class Endpoint {
		constructor(command) {
			assert.argumentIsRequired(command, 'command', CommandHandler, 'CommandHandler');

			this._command = command;
		}

		getCommand() {
			return this._command;
		}

		toString() {
			return '[Endpoint]';
		}
	}

	return Endpoint;
})();