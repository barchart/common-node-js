var _ = require('lodash');
var log4js = require('log4js');

var QueryProvider = require('./../QueryProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/providers/HardcodeQueryProvider');

	var HardcodeQueryProvider = QueryProvider.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_runQuery: function(criteria) {
			return _.clone(this._getConfiguration().results, true);
		},

		toString: function() {
			return '[HardcodeQueryProvider]';
		}
	});

	return HardcodeQueryProvider;
}();