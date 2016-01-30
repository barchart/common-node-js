var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/MutateResultProcessor');

	var MutateResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);

			var configurationArray;

			if (_.isArray(configuration.items)) {
				configurationArray = configuration.items;
			} else {
				configurationArray = [configuration];
			}

			this._configurationArray = configurationArray;
		},

		_process: function(results) {
			var that = this;

			if (_.isUndefined(results) || _.isNull(results)) {
				logger.warn('Skipping result processor (' + that.toString() + ') due to undefined or null results.');

				return results;
			}

			var resultsToProcess;

			if (_.isArray(results)) {
				resultsToProcess = results;
			} else {
				resultsToProcess = [results];
			}

			var processedResults = _.map(resultsToProcess, function(result) {
				_.forEach(that._configurationArray, function(configurationItem) {
					that._processItem(result, configurationItem);
				});

				return result;
			});

			var returnRef;

			if (_.isArray(results)) {
				returnRef = processedResults;
			} else {
				returnRef = processedResults[0];
			}

			return returnRef;
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			return;
		},

		toString: function() {
			return '[MutateResultProcessor]';
		}
	});

	return MutateResultProcessor;
}();