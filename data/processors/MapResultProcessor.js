var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('data/processors/MapResultProcessor');

    var MapResultProcessor = MutateResultProcessor.extend({
        init: function(configuration) {
            this._super(configuration);
        },

        _processItem: function(resultItemToProcess, configurationToUse) {
            var propertyName = configurationToUse.propertyName;
            var map = configurationToUse.map;

            var propertyValue = attributes.read(resultItemToProcess, propertyName);

            if (_.has(map, propertyValue)) {
                attributes.write(resultItemToProcess, propertyName, map[propertyValue]);
            }
        },

        toString: function() {
            return '[MapResultProcessor]';
        }
    });

    return MapResultProcessor;
}();