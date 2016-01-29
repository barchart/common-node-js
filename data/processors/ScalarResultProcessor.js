var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('data/processors/ScalarResultProcessor');

    var ScalarResultProcessor = ResultProcessor.extend({
        init: function(configuration) {
            this._super(configuration);
        },

        _process: function(results) {
            var result;

            if (_.isArray(results)) {
                if (results.length === 0) {
                    result = undefined;
                } else if (results.length === 1) {
                    result = results[0];
                } else {
                    throw new Error('Data provider returned multiple results when scalar value was expected.');
                }
            } else {
                result = results;
            }

            return result;
        },

        toString: function() {
            return '[ScalarResultProcessor]';
        }
    });

    return ScalarResultProcessor;
}();