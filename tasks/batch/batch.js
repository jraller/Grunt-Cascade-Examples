/*jslint node:true */

'use strict';

/*

This will simulate setting up a new site according to a recipe.
Run it against an empty site.
Due to how create works if you run it twice it will make duplicates of each folder and file with a number appended to the end of their name.
If you were writing this for production you'd want to do something closer to the code in grunt-cascade-deploy: https://github.com/jraller/grunt-cascade-deploy

make _fred folder
	make internal sally folder -- which will be relying on the existence of _fred being in place. Order of execution.

for additional tasks look to the other examples.

*/

var grunt = {},
	done,
	nextList = [],
	soap = require('soap-cascade'),
	client = {},
	inquirer = require('inquirer'),
	soapArgs = {
		authentication: {
			password: '',
			username: ''
		}
	},
	questions = [
		{
			type: 'input',
			name: 'username',
			message: 'Username: ',
			'default': 'yourUsernameHereIfYouWant'
		},
		{
			type: 'password',
			name: 'password',
			message: 'Password: '
		},
		{
			type: 'input',
			name: 'siteName',
			message: 'Sitename: '
		}
	],
	siteName;

function next() {
	var todo,
		current,
		task,
		args = {};
	if (arguments.length > 0) {
		if (!Array.isArray(arguments['0'])) {
			todo = [arguments];
		} else {
			todo = [];
			arguments['0'].forEach(function (item) {
				todo.push(item);
			});
		}
		nextList = todo.concat(nextList);
	}
	if (nextList.length > 0) {
		current = Array.prototype.slice.apply(nextList.shift());
		task = current[0];
		args = current.slice(1);
		task.apply(null, args);
	}
}

function die() {
	nextList = [];
}

function report(message) {
	if (typeof message === 'string') {
		grunt.log.writeln(message);
	} else {
		console.dir(message);
	}
	next();
}

function handleError(err, caller) {
	die();
	if (!caller) {
		caller = 'A function';
	}
	next([
		[report, caller + ' responded with: ' + err.message],
		[done]
	]);
}

function makeSite() {
	var action = {},
		results = [
			'checkOutResult',
			'createResult',
			'listMessagesResult',
			'operationResult',
			'readAccessRightsResult',
			'readAuditsResult',
			'readResult',
			'readWorkflowInformationResult',
			'searchResult'
		],
		batchCount = 0;
	soapArgs.operation = [];
	action.create = {};
	action.create.asset = {};
	action.create.asset.folder = {};
	action.create.asset.folder.name = '_fred';
	action.create.asset.folder.parentFolderPath = '/';
	action.create.asset.folder.siteName = siteName;
	soapArgs.operation.push(action);

	action = {}; // action must be cleared in order to not muck about via reference what we've already pushed to the array
	action.create = {};
	action.create.asset = {};
	action.create.asset.folder = {};
	action.create.asset.folder.name = 'sally';
	action.create.asset.folder.parentFolderPath = '/_fred';
	action.create.asset.folder.siteName = siteName;
	soapArgs.operation.push(action);

	client.batch(soapArgs, function (err, response) {
		grunt.log.writeln(client.lastRequest);
		grunt.log.writeflags(response);
		if (err) {
			grunt.log.writeln('Error with batch: ' + err.message);
			die();
			next(done);
		} else { // this is not yet well written, but provided as a framework to build on
			grunt.log.writeln('batch run:');
			if (!Array.isArray(response.batchReturn)) {
				response.batchReturn = [response.batchReturn];
			}
			response.batchReturn.forEach(function (report) {
				results.forEach(function (resultType) {
					if (report[resultType].success) { // did the reply mention the success of this resultType
						if (report[resultType].success.toString() === 'true') { // was it successful
							grunt.log.writeln('a call to ' + resultType + ' was successful and type specific output is possible');
						} else { // or not successful
							grunt.log.writeln('There was an issue with ' + resultType + ' that sent the message:' + report[resultType].messsage);
						}
					}
				});
			});
		}
	});
}

function createClient() {
	var url = grunt.config('cascade.server'),
		ws = grunt.config('cascade.ws');
	soap.createClient(url + ws, function (err, clientObj) {
		if (err) {
			grunt.log.writeln('Error creating client: ' + err.message);
			die();
			next(done);
		} else {
			grunt.log.writeln('Client created');
			client = clientObj;
			next();
		}
	});
}

function bugUser() {
	inquirer.prompt(questions, function (answers) {
		soapArgs.authentication.username = answers.username;
		soapArgs.authentication.password = answers.password;
		siteName = answers.siteName;
		next();
	});
}

module.exports = function (gruntObj) {
	gruntObj.registerTask('batch', 'call the read action for the default connector container', function () {
		grunt = gruntObj;
		done = this.async();
		next([
			[bugUser],
			[createClient],
			[makeSite],
			[report, 'all our tasks are done'],
			[done]
		]);
	});
};
