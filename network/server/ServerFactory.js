var Class = require('class.extend');
var when = require('when');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

var ServerDefinition = require('./ServerDefinition');

module.exports = function() {
	var ServerFactory = Class.extend({
		init: function() {

		},

		build: function(serverDefinition) {
			assert.argumentIsRequired(serverDefinition, 'serverDefinition', ServerDefinition, 'ServerDefinition');

			var that = this;

			return when.try(function() {
				return that._build(serverDefinition.getContainers(), serverDefinition.getStaticPaths(), serverDefinition.getTemplatePath());
			});
		},

		_build: function(containers, staticPath, templatePath) {
			return Disposable.fromAction(function() {
				return;
			});
		},

		toString: function() {
			return '[ServerFactory]';
		}
	});

	return ServerFactory;
}();