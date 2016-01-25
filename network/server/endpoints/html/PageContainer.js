var _ = require('lodash');
var when = require('when');

var assert = require('common/lang/assert');

var Container = require('./../Container');
var PageEndpoint = require('./PageEndpoint');

module.exports = function() {
	'use strict';

	var PageContainer = Container.extend({
		init: function (port, path, secure) {
			this._super(port, path, secure);
		},

		_getEndpointType: function () {
			return PageEndpoint;
		},

		toString: function() {
			return '[PageContainer]';
		}
	});

	return PageContainer;
}();