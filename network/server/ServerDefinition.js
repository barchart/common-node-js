var assert = require('common/lang/assert');

var Container = require('./endpoints/Container');

module.exports = (() => {
	'use strict';

	class ServerDefinition {
		constructor() {
			this._containers = [];

			this._staticPaths = null;
			this._templatePath = null;
		}

		withContainer(container) {
			assert.argumentIsRequired(container, 'container', Container, 'Container');

			this._containers.push(container);

			return this;
		}

		withStaticPath(staticFilePath, staticServerPath) {
			assert.argumentIsRequired(staticFilePath, 'staticFilePath', String);
			assert.argumentIsRequired(staticServerPath, 'staticServerPath', String);

			this._staticPaths = this._staticPaths || {};

			if (this._staticPaths.hasOwnProperty(staticServerPath)) {
				throw new Error('The path for serving static files has already been defined.');
			}

			this._staticPaths[staticServerPath] = staticFilePath;

			return this;
		}

		withTemplatePath(templatePath) {
			assert.argumentIsRequired(templatePath, 'templatePath', String);

			this._templatePath = templatePath;

			return this;
		}

		getContainers() {
			return this._containers;
		}

		getStaticPaths() {
			return this._staticPaths;
		}

		getTemplatePath() {
			return this._templatePath;
		}

		static withContainer(container) {
			const serverDefinition = new ServerDefinition();

			return serverDefinition.withContainer(container);
		}

		toString() {
			return '[ServerDefinition]';
		}
	}

	return ServerDefinition;
})();