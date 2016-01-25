var _ = require('lodash');
var Class = require('class.extend');

var assert = require('common/lang/assert');

var Container = require('./endpoints/Container');

module.exports = function() {
    'use strict';

    var ServerDefinition = Class.extend({
        init: function() {
            this._containers = [ ];

            this._staticPaths = null;
            this._templatePath = null;
        },

        withContainer: function(container) {
            assert.argumentIsRequired(container, 'container', Container, 'Container');

            this._containers.push(container);

            return this;
        },

        withStaticPath: function(staticFilePath, staticServerPath) {
            assert.argumentIsRequired(staticFilePath, 'staticFilePath', String);
			assert.argumentIsRequired(staticServerPath, 'staticServerPath', String);

			this._staticPaths = this._staticPaths || { };

			if (_.has(this._staticPaths, staticServerPath)) {
				throw new Error('The path for serving static files has already been defined.');
			}

			this._staticPaths[staticServerPath] = staticFilePath;

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

        getStaticPaths: function() {
            return this._staticPaths;
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