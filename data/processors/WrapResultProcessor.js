var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/WrapResultProcessor');

	var WrapResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_process: function(results) {
			var configuration = this._getConfiguration();

			if (!_.isString(configuration.propertyName)) {
				return;
			}

			var returnRef = { };

			attributes.write(returnRef, configuration.propertyName, results);

			return returnRef;
		},

		toString: function() {
			return '[WrapResultProcessor]';
		}
	});

	return WrapResultProcessor;
}();