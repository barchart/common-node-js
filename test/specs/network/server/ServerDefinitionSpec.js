var ServerDefinition = require('./../../../../network/server/ServerDefinition');

describe('When a ServerDefinition is created', function() {
	'use strict';

	var serverDefinition;

	beforeEach(function() {
		serverDefinition = new ServerDefinition();
	});

	it('should have no containers', function() {
		expect(serverDefinition.getContainers().length).toEqual(0);
	});
});