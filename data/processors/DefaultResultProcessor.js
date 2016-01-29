var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('data/processors/DefaultResultProcessor');

    var DefaultResultProcessor = MutateResultProcessor.extend({
        init: function(configuration) {
            this._super(configuration);
        },

        _processItem: function(resultItemToProcess, configurationToUse) {
            var propertyName = configurationToUse.propertyName;
            var propertyValue = attributes.read(resultItemToProcess, propertyName);

            if (_.isUndefined(propertyValue)) {
                attributes.write(resultItemToProcess, propertyName, configurationToUse.defaultValue);
            }
        },

        toString: function() {
            return '[DefaultResultProcessor]';
        }
    });

    return DefaultResultProcessor;
}();