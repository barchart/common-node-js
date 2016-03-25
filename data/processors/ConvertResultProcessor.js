var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/ConvertResultProcessor');

	var ConvertResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var propertyName = configurationToUse.propertyName;

			if (attributes.has(resultItemToProcess, propertyName)) {
				var propertyValue = attributes.read(resultItemToProcess, propertyName);
				var propertyType = configurationToUse.propertyType;

				if (propertyType.toUpperCase() === 'STRING') {
					if (_.isNull(propertyValue)) {
						propertyType = 'null';
					} else if (_.isUndefined(propertyValue)) {
						propertyType = 'undefined';
					} else {
						propertyType = propertyValue.toString();
					}
				}

				attributes.write(resultItemToProcess, propertyName, propertyType);
			}
		},

		toString: function() {
			return '[ConvertResultProcessor]';
		}
	});

	return ConvertResultProcessor;
}();