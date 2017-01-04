var ContextQueryProvider = require('./../../../../data/providers/ContextQueryProvider');

describe('When running a ContextQueryProvider, configured read a single property', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ContextQueryProvider({ proeprty: 'a.b.c' });
	});

	describe('and the property exists', function() {
		var context;
		var resultPromise;

		beforeEach(function() {
			processor = new ContextQueryProvider({ property: 'a.b.c' });

			resultPromise = processor.runQuery(context = { a: { b : { c: { } } } });
		});

		it('the promised result should match the context passed to the provider', function(done) {
			resultPromise.then(function(result) {
				expect(result).toBe(context.a.b.c);

				done();
			});
		});
	});

	describe('and the property does not exist', function() {
		var context;
		var resultPromise;

		beforeEach(function() {
			processor = new ContextQueryProvider({ property: 'a.b.c' });

			resultPromise = processor.runQuery(context = { x: { y : { z: { } } } });
		});

		it('the promised result should match the context passed to the provider', function(done) {
			resultPromise.then(function(result) {
				expect(result).toEqual(undefined);

				done();
			});
		});
	});
});

describe('When running a ContextQueryProvider, configured read two properties', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ContextQueryProvider({ properties: [ 'a', 'b' ] });
	});

	describe('and both properties exist', function() {
		var context;
		var resultPromise;

		beforeEach(function() {
			resultPromise = processor.runQuery(context = { a: { }, b: { } });
		});

		it('the promised result should have the first property', function(done) {
			resultPromise.then(function(result) {
				expect(result.a).toBe(context.a);

				done();
			});
		});

		it('the promised result should have the second property', function(done) {
			resultPromise.then(function(result) {
				expect(result.b).toBe(context.b);

				done();
			});
		});
	});

	describe('and the first property exists', function() {
		var context;
		var resultPromise;

		beforeEach(function() {
			resultPromise = processor.runQuery(context = { a: { } });
		});

		it('the promised result should have the first property', function(done) {
			resultPromise.then(function(result) {
				expect(result.a).toBe(context.a);

				done();
			});
		});

		it('the promised result should not have the second property', function(done) {
			resultPromise.then(function(result) {
				expect(result.hasOwnProperty(('b'))).toEqual(false);

				done();
			});
		});
	});
});

describe('When running a ContextQueryProvider, configured to use the "current" option', function() {
	'use strict';

	var context;
	var resultPromise;

	beforeEach(function() {
		var processor = new ContextQueryProvider({ current: true });

		resultPromise = processor.runQuery(context = { });
	});

	it('the promised result should match the context passed to the provider', function(done) {
		resultPromise.then(function(result) {
			expect(result).toBe(context);

			done();
		});
	});
});