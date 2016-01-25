var Class = require('class.extend');

var assert = require('common/lang/assert');

var Container = require('./endpoints/Container');

module.exports = function() {
    'use strict';

    var ServerDefinition = Class.extend({
        init: function() {
            this._containers = [ ];

            this._staticPath = null;
            this._templatePath = null;
        },

        withContainer: function(container) {
            assert.argumentIsRequired(container, 'container', Container, 'Container');

            this._containers.push(container);

            return this;
        },

        withStaticPath: function(staticPath) {
            assert.argumentIsRequired(staticPath, 'staticPath', String);

            this._staticPath = staticPath;

            return this;
        },

        withTemplatePath: function(templatePath) {
            assert.argumentIsRequired(templatePath, 'templatePath', String);

            this._templatePath = templatePath;

            return this;
        },

        getContainers: function() {
            return this._containers;
        },

        getStaticPath: function() {
            return this._staticPath;
        },

        getTemplatePath: function() {
            return this._templatePath;
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