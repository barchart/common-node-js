var JoinResultProcessor = require('./../../../../data/processors/JoinResultProcessor');

describe('When using the JoinResultProcessor a source array', function() {
	'use strict';

	var context;
	var resultPromise;

	beforeEach(function() {
		var processor = new JoinResultProcessor({ target: 'myTarget', targetProperty: 'letter', source: 'mySource', sourceProperty: 'symbol', alias: 'other' });

		resultPromise = processor.process(context = {
			myTarget: [
				{ letter: 'a' },
				{ letter: 'b' },
				{ letter: 'a' }
			],
			mySource: [
				{ symbol: 'a', ascii: 97 },
				{ symbol: 'b', ascii: 98 }
			]
		});
	});

	it('the promised result be the target object', function(done) {
		resultPromise.then(function(result) {
			expect(result).toBe(context.myTarget);

			done();
		});
	});

	it('an alias property, containing the joined data, should be found on each property', function(done) {
		resultPromise.then(function(result) {
			expect(result[0].other).toBe(context.mySource[0]);
			expect(result[1].other).toBe(context.mySource[1]);
			expect(result[2].other).toBe(context.mySource[0]);

			done();
		});
	});
});

describe('When using the JoinResultProcessor with a source map', function() {
	'use strict';

	var context;
	var resultPromise;

	beforeEach(function() {
		var processor = new JoinResultProcessor({ target: 'myTarget', targetProperty: 'letter', source: 'ascii', sourceProperty: 'symbol', alias: 'code' });

		resultPromise = processor.process(context = {
			myTarget: [
				{ letter: 'a' },
				{ letter: 'b' },
				{ letter: 'a' }
			],
			ascii: {
				a: 97,
				b: 98
			}
		});
	});

	it('the promised result be the target object', function(done) {
		resultPromise.then(function(result) {
			expect(result).toBe(context.myTarget);

			done();
		});
	});

	it('an alias property, containing the joined data, should be found on each property', function(done) {
		resultPromise.then(function(result) {
			expect(result[0].code).toBe(97);
			expect(result[1].code).toBe(98);
			expect(result[2].code).toBe(97);

			done();
		});
	});
});