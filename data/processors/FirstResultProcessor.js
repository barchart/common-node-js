var _ = require('lodash');
var log4js = require('log4js');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('data/processors/FirstResultProcessor');

    var FirstResultProcessor = ResultProcessor.extend({
        init: function(configuration) {
            this._super(configuration);
        },

        _process: function(results) {
            var result;

            if (_.isArray(results)) {
                if (results.length !== 0) {
                    result = results[0];
                } else {
                    result = undefined;
                }
            } else {
                result = results;
            }

            return result;
        },

        toString: function() {
            return '[FirstResultProcessor]';
        }
    });

    return FirstResultProcessor;
}();