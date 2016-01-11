var assert = require('common/lang/assert');

var Endpoint = require('./../Endpoint');
var RestAction = require('./RestAction');

module.exports = function() {
    'use strict';

    var RestEndpoint = Endpoint.extend({
        init: function(action, path, command) {
            this._super(command);

            assert.argumentIsRequired(action, 'action', RestAction, 'RestAction');
            assert.argumentIsRequired(path, 'path', String);

            this._action = action;
            this._path = path;
        },

        getRestAction: function() {
            return this._action;
        },

        getPath: function() {
            return this._path;
        },

        toString: function() {
            return '[RestEndpoint]';
        }
    });

    return RestEndpoint;
}();