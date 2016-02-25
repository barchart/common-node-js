var _ = require('lodash');
var aws = require('aws-sdk');
var when = require('when');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/S3Provider');

	var S3Provider = Disposable.extend({
		init: function(configuration) {
			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._super();

			this._s3 = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;
		},

		start: function() {
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The S3 Provider has been disposed.');
			}

			if (that._startPromise === null) {
				that._startPromise = when.try(function() {
					aws.config.update({region: that._configuration.region});

					that._s3 = new aws.S3({apiVersion: that._configuration.apiVersion || '2010-12-01'});
				}).then(function() {
					logger.info('S3 provider started');

					that._started = true;

					return that._started;
				}).catch(function(e) {
					logger.error('S3 provider failed to start', e);

					throw e;
				});
			}

			return that._startPromise;
		},

		getBucketContents: function(bucket){
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The S3 Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SES Provider has not been started.');
			}

			return when.promise(function(resolveCallback, rejectCallback) {
				that._s3.listObjects({"Bucket": bucket}, function(err, data){ 
					if(err){
						logger.error('S3 failed to retrieve contents: ', err);
						resolveCallback({
							content: "",
							error: true
						});
					} else{
						resolveCallback({  
							content: data.Contents,
							success: false
						});
					}
				});
			});
		},

		uploadObject: function(bucket, fileName, buffer, mimeType){
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The S3 Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SES Provider has not been started.');
			}

			var params = {Bucket: bucket, Key: fileName, ACL: 'public-read', Body: buffer, ContentType: mimeType};
			var options = {partSize: 10 * 1024 * 1024, queueSize: 1};

			return when.promise(function(resolveCallback, rejectCallback) {
				that._s3.upload(params, options, function(err, data) {
					if(err){
						logger.error('S3 failed to upload object: ', err);
						resolveCallback({success: false, error: err});
					} else{
						resolveCallback({success: false, data: data});
					}
				});
			});
		},

		deleteObject: function(bucket,key){
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The S3 Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SES Provider has not been started.');
			}

			var params = {Bucket: bucket, Key: key, };

			return when.promise(function(resolveCallback, rejectCallback) {	
				that._s3.deleteObject(params, function(err, data) {
					if(err){
						logger.error('S3 failed to delete object: ', err);
						resolveCallback({success: false, error: err});
					} else{
						resolveCallback({success: false, data: data});
					}
				});
			});
		},

		_onDispose: function() {
			logger.debug('S3 provider disposed');
		},

		toString: function() {
			return '[S3Provider]';
		}
	});


	return S3Provider;
}();