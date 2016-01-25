var _ = require('lodash');
var when = require('when');

var assert = require('common/lang/assert');

var Container = require('./../Container');
var RestEndpoint = require('./RestEndpoint');
var RestAction = require('./RestAction');

module.exports = function() {
    'use strict';

    var RestContainer = Container.extend({
        init: function (port, path, secure) {
            this._super(port, path, secure);
        },

        _getEndpointType: function () {
            return RestEndpoint;
        },

        toString: function() {
            return '[RestContainer]';
        }
    });

    return RestContainer;
}();