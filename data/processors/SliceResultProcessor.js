var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('data/processors/SliceArrayProcessor');

    var SliceArrayProcessor = ResultProcessor.extend({
        init: function(configuration) {
            this._super(configuration);
        },

        _process: function(results) {
            var configuration = this._getConfiguration();

            var result;

            var start = configuration.start;
            var end = configuration.end;

            if (_.isNumber(start) && _.isArray(results)) {
                if (_.isNumber(end)) {
                    end = configuration.end;
                } else {
                    end = undefined;
                }

                result = results.slice(start, end);
            } else {
                result = results;
            }

            return result;
        },

        toString: function() {
            return '[SliceArrayProcessor]';
        }
    });

    return SliceArrayProcessor;
}();