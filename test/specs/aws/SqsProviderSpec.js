var SqsProvider = require('./../../../aws/SqsProvider');

describe('When an SQS Provider created', function() {
	'use strict';

	var provider;
	var configuration;

	beforeEach(function() {
		provider = new SqsProvider(configuration = {
			region: 'somewhere',
			prefix: 'suffix'
		});
	});

	describe('and it is disposed', function() {
		beforeEach(function() {
			provider.dispose();
		});

		it('should be disposed', function() {
			expect(provider.getIsDisposed()).toEqual(true);
		});
	});
});