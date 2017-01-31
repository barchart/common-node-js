var S3Provider = require('./../../../aws/S3Provider');

describe('When creating a qualified filename for s3', function() {
	'use strict';

	it('using strings, the correct path should be generated', function() {
		expect(S3Provider.getQualifiedFilename('\\a\\', '\\b\\', '/c/', '/d/')).toEqual('a/b/c/d');
	});

	it('using strings, the correct path should be generated', function() {
		expect(S3Provider.getQualifiedFilename('\\a\\', [ '\\b\\', '/c/' ], '/d/')).toEqual('a/b/c/d');
	});

	it('using strings, the correct path should be generated', function() {
		expect(S3Provider.getQualifiedFilename('//a/b/c/d')).toEqual('a/b/c/d');
	});

	it('using strings, the correct path should be generated', function() {
		expect(S3Provider.getQualifiedFilename('\\a\\b\\c\\d')).toEqual('a/b/c/d');
	});

	it('using strings, the correct path should be generated', function() {
		expect(S3Provider.getQualifiedFilename('local', '/trading-overview/report/21fa0303-45b9-41df-996e-b04192f100b6.html')).toEqual('local/trading-overview/report/21fa0303-45b9-41df-996e-b04192f100b6.html');
	});
});