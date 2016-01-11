var Class = require('class.extend');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');
var CommandHandler = require('common/commands/CommandHandler');

module.exports = function() {
    'use strict';

    var logger = log4js.getLogger('http/endpoints/Endpoint');

    var Endpoint = Class.extend({
        init: function(command) {
            assert.argumentIsRequired(command, 'command', CommandHandler, 'CommandHandler');

            this._command = command;
        },

        getCommand: function() {
            return this._command;
        },

        toString: function() {
            return '[Endpoint]';
        }
    });

    return Endpoint;
}();