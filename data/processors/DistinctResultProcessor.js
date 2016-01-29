var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('data/processors/DistinctResultProcessor');

    var DistinctResultProcessor = ResultProcessor.extend({
        init: function(configuration) {
            this._super(configuration);
        },

        _process: function(results) {
            var configuration = this._getConfiguration();

            var returnRef;

            if (_.isString(configuration.property)) {
                var propertyName = configuration.property;

                returnRef =
                    _.map(
                        _.unique(
                            _.map(results, function(result) {
                                return attributes.read(result, propertyName);
                            })
                        ), function(uniqueValue) {
                            var uniqueItem = { };

                            uniqueItem[propertyName] = uniqueValue;

                            return uniqueItem;
                        }
                    );
            } else {
                returnRef = results;
            }

            return returnRef;
        },

        toString: function() {
            return '[DistinctResultProcessor]';
        }
    });

    return DistinctResultProcessor;
}();