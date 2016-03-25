var _ = require('lodash');
var log4js = require('log4js');
var moment = require('moment');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/FilterResultProcessor');

	var FilterResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_process: function(results) {
			var configuration = this._getConfiguration();

			if (_.isObject(configuration.equals)) {
				results = _.filter(results, function(result) {
					return _.every(configuration.equals, function(expectedValue, propertyName) {
						return attributes.has(result, propertyName) && attributes.read(result, propertyName) === expectedValue;
					});
				});
			}

			if (_.isObject(configuration.regex)) {
				results = _.filter(results, function(result) {
					return _.every(configuration.regex, function(expression, propertyName) {
						var regex = new RegExp(expression);

						return attributes.has(result, propertyName) && regex.test(attributes.read(result, propertyName));
					});
				});
			}

			if (_.isArray(configuration.empty)) {
				results = _.filter(results, function(result) {
					return _.every(configuration.empty, function(propertyName) {
						var returnVal;

						if (attributes.has(result, propertyName)) {
							var value = attributes.read(result, propertyName);

							returnVal = _.isNull(value) || _.isUndefined(value) || value === '';
						} else {
							returnVal = true;
						}

						return returnVal;
					});
				});
			}

			if (_.isObject(configuration.special)) {
				var now = moment();

				results = _.filter(results, function(result) {
					return _.every(configuration.special, function(specialOperation, propertyName) {
						var returnVal = attributes.has(result, propertyName);

						if (returnVal) {
							var propertyValue = attributes.read(result, propertyName);

							if (specialOperation === 'today') {
								var m = moment(propertyValue);

								returnVal = m.isValid() &&
									m.year() === now.year() &&
									m.month() === now.month() &&
									m.date() === now.date();
							}
						}

						return returnVal;
					});
				});
			}

			return results;
		},

		toString: function() {
			return '[FilterResultProcessor]';
		}
	});

	return FilterResultProcessor;
}();