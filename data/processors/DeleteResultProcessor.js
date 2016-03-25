var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/DeleteResultProcessor');

	var DeleteResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			if (!(_.isString(configurationToUse) || _.isString(configurationToUse.propertyName))) {
				return;
			}

			attributes.erase(resultItemToProcess, configurationToUse.propertyName || configurationToUse);
		},

		toString: function() {
			return '[DeleteResultProcessor]';
		}
	});

	return DeleteResultProcessor;
}();