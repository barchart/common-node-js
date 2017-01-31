var S3Provider = require('./../../../aws/S3Provider');

describe('When creating a qualified filename for s3', function() {
	'use strict';

	describe('using strings', function() {
		it('should return a properly-formatted key', function() {
			expect(S3Provider.getQualifiedFilename('a/b\\\\c', '\\d')).toEqual('a/b/c/d');
		});

		it('should return a properly-formatted key', function() {
			expect(S3Provider.getQualifiedFilename('\\a\/b\\\\c/', '\\d\\')).toEqual('a/b/c/d');
		});

		it('should return a properly-formatted key', function() {
			expect(S3Provider.getQualifiedFilename('a\\b\\c', 'd')).toEqual('a/b/c/d');
		});

		it('should return a properly-formatted key', function() {
			expect(S3Provider.getQualifiedFilename('a\\b\\', 'c\\d')).toEqual('a/b/c/d');
		});

		it('should return a properly-formatted key', function() {
			expect(S3Provider.getQualifiedFilename('a\\b\\c\\d')).toEqual('a/b/c/d');
		});
	});

	describe('using an array', function() {
		it('should return a properly-formatted key', function() {
			expect(S3Provider.getQualifiedFilename([ 'a', '\\\\b', 'c//'], '\\d')).toEqual('a/b/c/d');
		});

		it('should return a properly-formatted key', function() {
			expect(S3Provider.getQualifiedFilename(['a\\b', 'c'], 'd')).toEqual('a/b/c/d');
		});

		it('should return a properly-formatted key', function() {
			expect(S3Provider.getQualifiedFilename(['a', 'b', 'c'], 'd')).toEqual('a/b/c/d');
		});

		it('should return a properly-formatted key', function() {
			expect(S3Provider.getQualifiedFilename(['a', 'b', 'c', 'd'])).toEqual('a/b/c/d');
		});
	});
});