var Class = require('class.extend');

var assert = require('common/lang/assert');

var Container = require('./endpoints/Container');

module.exports = function() {
    'use strict';

    var ServerDefinition = Class.extend({
        init: function() {
            this._containers = [ ];
        },

        withContainer: function(container) {
            assert.argumentIsRequired(container, 'container', Container, 'Container');

            this._containers.push(container);

            return this;
        },

        getContainers: function() {
            return this._containers;
        },

        toString: function() {
            return '[ServerDefinition]';
        }
    });

    ServerDefinition.withContainer = function(container) {
        var serverDefinition = new ServerDefinition();

        return serverDefinition.withContainer(container);
    };

    return ServerDefinition;
}();