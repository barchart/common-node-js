var _ = require('lodash');
var log4js = require('log4js');
var moment = require('moment');

var QueryProvider = require('./../QueryProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/providers/TimestampQueryProvider');

	var TimestampQueryProvider = QueryProvider.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_runQuery: function(criteria) {
			var m = moment();

			var configuration = this._getConfiguration();

			if (_.isObject(configuration.add) && _.isNumber(configuration.add.seconds)) {
				m = m.add(configuration.add.seconds, 's');
			}

			return {
				moment: m,
				date: m.toDate(),
				day: m.date(),
				dayNumber: m.format('D'),
				dayShort: m.format('Do'),
				dayName: m.format('dddd'),
				month: m.month(),
				monthNumber: m.format('M'),
				monthShort: m.format('MMM'),
				monthName: m.format('MMMM'),
				year: m.year(),
				hour: m.hour(),
				minute: m.minute(),
				second: m.second(),
				timezone: 'CST',
				timeDisplay: m.format('h:mm A [CST]'),
				dateDisplay: m.format('MMMM D, YYYY'),
				unix: m.format('x')
			};
		},

		toString: function() {
			return '[TimestampQueryProvider]';
		}
	});

	return TimestampQueryProvider;
}();