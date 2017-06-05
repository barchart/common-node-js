const fs = require('fs');
const handlebars = require('handlebars');
const log4js = require('log4js');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('templates/TemplateSelector');

	class TemplateSelector {
		constructor(name) {
			this._name = name;

			this._selectors = [ ];
		}

		withHandlebarsTemplateFromFile(selector, path) {
			this._selectors.push(new FileHandlebarsTemplate(selector, path));

			return this;
		}

		withHandlebarsTemplateFromLiteral(selector, text) {
			this._selectors.push(new LiteralHandlebarsTemplate(selector, text));

			return this;
		}

		withHandlebarsTemplateFromData(selector, extractor) {
			this._selectors.push(new DynamicHandlebarsTemplate(selector, extractor));

			return this;
		}

		merge(data) {
			const template = this._selectors.find((candidate) => {
				return candidate.canMerge(data);
			});

			if (!template) {
				throw new Error(`Unable to merge, no suitable (${this._name}) template could be found.`);
			}

			return template.merge(data);
		}

		static withName(name) {
			return new TemplateSelector(name);
		}

		toString() {
			return `[TemplateSelector (name=${this._name}]`;
		}
	}

	class Template {
		constructor(selector) {
			this._selector = selector;
		}

		canMerge(data) {
			return this._selector(data) === true;
		}

		merge(data) {
			if (!this.canMerge(data)) {
				throw new Error('Template is incompatible with data');
			}

			return Promise.resolve()
				.then(() => {
					return this.onMerge(data);
				});
		}

		onMerge(data) {
			return null;
		}
	}

	class HandlebarsTemplate extends Template {
		constructor(selector) {
			super(selector);
		}

		onMerge(data) {
			return this.loadTemplate(data)
				.then((template) => {
					return template(data);
				});
		}

		loadTemplate(data) {
			return null;
		}
	}

	class LiteralHandlebarsTemplate extends HandlebarsTemplate {
		constructor(selector, text) {
			super(selector);

			this._text = text;
			this._templatePromise = null;
		}

		loadTemplate(data) {
			if (this._templatePromise === null) {
				this._templatePromise = new Promise((resolveCallback, rejectCallback) => {
					resolveCallback(handlebars.compile(this._text));
				});
			}

			return this._templatePromise;
		}
	}

	class DynamicHandlebarsTemplate extends HandlebarsTemplate {
		constructor(selector, extractor) {
			super(selector);

			this._extractor = extractor;
		}

		loadTemplate(data) {
			return new Promise((resolveCallback, rejectCallback) => {
				resolveCallback(handlebars.compile(this._extractor(data)));
			});
		}
	}

	class FileHandlebarsTemplate extends HandlebarsTemplate {
		constructor(selector, path) {
			super(selector);

			this._path = path;
			this._templatePromise = null;
		}

		loadTemplate(data) {
			if (this._templatePromise === null) {
				this._templatePromise = new Promise((resolveCallback, rejectCallback) => {
					fs.readFile(this._path, (error, data) => {
						if (error) {
							rejectCallback(error);
						} else {
							resolveCallback(handlebars.compile(data.toString()));
						}
					});
				});
			}

			return this._templatePromise;
		}
	}

	return TemplateSelector;
})();