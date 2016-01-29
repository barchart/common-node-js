var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('data/processors/JoinResultProcessor');

    var JoinResultProcessor = ResultProcessor.extend({
        init: function(configuration) {
            this._super(configuration);
        },

        _process: function(results) {
            var that = this;

            var configuration = that._getConfiguration();

            var target = attributes.read(results, configuration.target);
            var source = attributes.read(results, configuration.source);

            var joinProperty = configuration.join;
            var aliasProperty = configuration.alias;

            var sourceMap = _.indexBy(source, joinProperty);

            _.forEach(target, function(targetItem) {
                var joinValue = targetItem[joinProperty];
                var sourceItem = sourceMap[joinValue];

                attributes.write(targetItem, aliasProperty, sourceItem);
            });

            return target;
        },

        toString: function() {
            return '[JoinResultProcessor]';
        }
    });

    return JoinResultProcessor;
}();