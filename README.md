#barchart-common-node-js
##Common classes, utilities, and functions for exclusively for Node.js servers

This library can serve as the foundation for Node.js servers and
provides common utilities intended for use in Node.js applications.

Features include:

* Quick HTTP servers with REST and/or Socket.IO endpoints
* Asynchronous Request-Response Messaging (with Amazon SQS implementation)
* Asynchronous Publish-Subscribe Messaging (with Amazon SNS and SQS implementation)
* More

##Simple Setup

1.	Clone the [repository](https://github.com/barchart/barchart-common-node-js).

		git clone git@github.com:barchart/barchart-common-node-js.git

2.	Download third-party dependencies

		npm install


##Documentation

Generate documentation as follows:

	gulp document


##Consumers

This library can be references as an NPM dependency, as follows:

	{
	  "name": "Your Node.js Application",
	  "dependencies": {
		"common": "git+ssh://github.com/barchart/barchart-common-node-js",
	  }
	}

Running "npm install" locally requires that you have a valid SSH key.


##Use with Elastic Beanstalk application

It is possible to deploy an application to Elastic Beanstalk which
requires this library. An SSH key was created for "deploy" purposes.
It has read-only access to the repository and is stored in an S3 bucket.
In S3, the SSH keys are located at:

	/barchart-deploy-keys/barchart-common-node-js.deploy
	/barchart-deploy-keys/barchart-common-node-js.pub


So, in your consuming application, take the following steps:

1. Ensure the "instance profile" for the application can access the S3 bucket.
2. When an Elastic Beanstalk deployment runs, use the "ebextensions" feature to:
	1. Get the SSH key from S3 and set the correct file permissions
	2. Write out a ".ssh/config" file so that our "deploy" key is used to talk to Github
	3. Write out a ".ssh/known_hosts" file for github
3. Now, when "npm install" runs, we can download a *private* repository from Github.

Please refer to https://github.com/barchart/aws-beanstalk-nodejs-job-manager for an
example of the "ebextension" files.


###Release

Use gulp to test, package, and tag a new release as follows:

	gulp release


##License

This software is proprietary and intended for internal use by Barchart.com only.