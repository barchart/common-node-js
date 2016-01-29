var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('data/processors/OverwriteResultProcessor');

    var OverwriteResultProcessor = MutateResultProcessor.extend({
        init: function(configuration) {
            this._super(configuration);
        },

        _processItem: function(resultItemToProcess, configurationToUse) {
            attributes.write(resultItemToProcess, configurationToUse.propertyName, configurationToUse.overwriteValue);
        },

        toString: function() {
            return '[OverwriteResultProcessor]';
        }
    });

    return OverwriteResultProcessor;
}();