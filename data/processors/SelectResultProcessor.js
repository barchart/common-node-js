var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/SelectResultProcessor');

	var SelectResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_process: function(results) {
			var configuration = this._getConfiguration();

			if (configuration.properties) {
				var resultsToProcess;

				if (_.isArray(results)) {
					resultsToProcess = results;
				} else {
					resultsToProcess = [ results ];
				}

				resultsToProcess = _.map(resultsToProcess, function(result) {
					var transform = {};

					_.forEach(configuration.properties, function(outputPropertyName, inputPropertyName) {
						attributes.write(transform, outputPropertyName, attributes.read(result, inputPropertyName));
					});

					return transform;
				});

				if (_.isArray(results)) {
					results = resultsToProcess;
				} else {
					results = resultsToProcess[0];
				}
			}

			return results;
		},

		toString: function() {
			return '[SelectResultProcessor]';
		}
	});

	return SelectResultProcessor;
}();