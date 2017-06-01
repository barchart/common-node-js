var RangeIntersectionResultProcessor = require('./../../../../data/processors/RangeIntersectionResultProcessor');

describe('When comparing a range to a set of one candidate ranges (using references)', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new RangeIntersectionResultProcessor({ startRef: 'a', endRef: 'b', candidates: [ { startRef: 'c', endRef: 'd' }] });
	});

	describe('where 0-to-5 is compared to 0-3', function() {
		var result;

		beforeEach(function(done) {
			processor.process({
				a: 0,
				b: 5,
				c: 1,
				d: 3
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function() {
			expect(result).toEqual(true);
		});
	});

	describe('where 0-to-5 is compared to 3-5', function() {
		var result;

		beforeEach(function(done) {
			processor.process({
				a: 0,
				b: 5,
				c: 3,
				d: 5
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function() {
			expect(result).toEqual(true);
		});
	});

	describe('where 0-to-5 is compared to 3-4', function() {
		var result;

		beforeEach(function(done) {
			processor.process({
				a: 0,
				b: 5,
				c: 3,
				d: 4
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function() {
			expect(result).toEqual(true);
		});
	});

	describe('where 0-to-5 is compared to -1-to-0', function() {
		var result;

		beforeEach(function(done) {
			processor.process({
				a: 0,
				b: 5,
				c: -1,
				d: 0
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function() {
			expect(result).toEqual(true);
		});
	});

	describe('where 0-to-5 is compared to 5-to-7', function() {
		var result;

		beforeEach(function(done) {
			processor.process({
				a: 0,
				b: 5,
				c: 5,
				d: 7
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function() {
			expect(result).toEqual(true);
		});
	});

	describe('where 0-to-5 is compared to -1-to-7', function() {
		var result;

		beforeEach(function(done) {
			processor.process({
				a: 0,
				b: 5,
				c: -1,
				d: 7
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function() {
			expect(result).toEqual(true);
		});
	});

	describe('where 0-to-5 is compared to -5-to--3', function() {
		var result;

		beforeEach(function(done) {
			processor.process({
				a: 0,
				b: 5,
				c: -5,
				d: -3
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function() {
			expect(result).toEqual(false);
		});
	});

	describe('where 0-to-5 is compared to 9-to-11', function() {
		var result;

		beforeEach(function(done) {
			processor.process({
				a: 0,
				b: 5,
				c: 9,
				d: 11
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function() {
			expect(result).toEqual(false);
		});
	});
});

describe('When comparing a range to a set of two candidate ranges (using references)', function() {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new RangeIntersectionResultProcessor({
			startRef: 'a',
			endRef: 'b',
			candidates: [{startRef: 'c', endRef: 'd'}, {startRef: 'e', endRef: 'f'}]
		});
	});

	describe('where only one candidate range intersects', function () {
		var result;

		beforeEach(function (done) {
			processor.process({
				a: 0,
				b: 5,
				c: 1,
				d: 3,
				e: 9,
				f: 11
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function () {
			expect(result).toEqual(true);
		});
	});

	describe('where only both candidate ranges intersects', function () {
		var result;

		beforeEach(function (done) {
			processor.process({
				a: 0,
				b: 5,
				c: 1,
				d: 3,
				e: 3,
				f: 4
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function () {
			expect(result).toEqual(true);
		});
	});

	describe('where neither candidate ranges intersect', function () {
		var result;

		beforeEach(function (done) {
			processor.process({
				a: 0,
				b: 5,
				c: 11,
				d: 22,
				e: 33,
				f: 44
			}).then((r) => {
				result = r;

				done();
			});
		});


		it('the range should intersect', function () {
			expect(result).toEqual(false);
		});
	});
});