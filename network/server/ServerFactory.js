var Class = require('class.extend');
var when = require('when');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

var ServerDefinition = require('./ServerDefinition');

module.exports = function() {
    var ServerFactory = Class.extend({
        init: function () {

        },

        build: function(serverDefinition) {
            assert.argumentIsRequired(serverDefinition, 'serverDefinition', ServerDefinition, 'ServerDefinition');

            return when(this._build(serverDefinition.getContainers()));
        },

        _build: function(containers) {
            return Disposable.fromAction(function () {
                return;
            });
        },

        toString: function () {
            return '[ServerFactory]';
        }
    });

    return ServerFactory;
}();