var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('data/processors/CopyResultProcessor');

    var CopyResultProcessor = MutateResultProcessor.extend({
        init: function(configuration) {
            this._super(configuration);
        },

        _processItem: function(resultItemToProcess, configurationToUse) {
            var targetPropertyNames;

            if (_.isString(configurationToUse.targetPropertyName)) {
                targetPropertyNames = [ configurationToUse.targetPropertyName ];
            } else if (_.isArray(configurationToUse.targetPropertyNames)) {
                targetPropertyNames = configurationToUse.targetPropertyNames;
            } else {
                targetPropertyNames = [ ];
            }

            var sourcePropertyValue = attributes.read(resultItemToProcess, configurationToUse.sourcePropertyName);

            if (_.isString(sourcePropertyValue) && configurationToUse.regex) {
                var matches = sourcePropertyValue.match(new RegExp(configurationToUse.regex));
                var matchedValue;

                if (_.isArray(matches) && matches.length !== 0) {
                    matchedValue = matches[0];
                } else {
                    matchedValue = '';
                }

                sourcePropertyValue = matchedValue;
            }

            _.forEach(targetPropertyNames, function(targetPropertyName) {
                attributes.write(resultItemToProcess, targetPropertyName, sourcePropertyValue);
            });
        },

        toString: function() {
            return '[CopyResultProcessor]';
        }
    });

    return CopyResultProcessor;
}();