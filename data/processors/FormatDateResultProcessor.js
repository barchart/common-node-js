var _ = require('lodash');
var log4js = require('log4js');
var moment = require('moment');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/FormatDateResultProcessor');

	var FormatDateResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var propertyName = configurationToUse.propertyName;
			var propertyValue = attributes.read(resultItemToProcess, propertyName);

			var m = moment(propertyValue);

			if (m.isValid()) {
				attributes.write(resultItemToProcess, propertyName, m.format(configurationToUse.format));
			}
		},

		toString: function() {
			return '[FormatDateResultProcessor]';
		}
	});

	return FormatDateResultProcessor;
}();