var Class = require('class.extend');
var when = require('when');

module.exports = function() {
	'use strict';

	var DataProviderFactory = Class.extend({
		init: function() {
			this._started = false;
		},

		start: function() {
			if (this._started) {
				throw new Error(this.toString() + ' has already been started.');
			}

			var that = this;

			that._started = true;

			return when.try(function() {
				that._start();
			}).then(function() {
				return that;
			});
		},

		_start: function() {
			return true;
		},

		build: function(configuration) {
			if (!this._started) {
				throw new Error('Unable to build data provider, the data provider factory has not been started.');
			}

			var that = this;

			return when.try(function() {
				return that._build(configuration);
			});
		},

		_build: function(configuration) {
			return null;
		},

		toString: function() {
			return '[DataProviderFactory]';
		}
	});

	return DataProviderFactory;
}();