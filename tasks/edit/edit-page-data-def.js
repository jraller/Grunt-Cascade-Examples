/*jslint node:true */

'use strict';

// user input replace content of file?

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
		},
		identifier: {
			path: {
				path: '',
				siteName: ''
			},
			type: 'page',
			recycled: 'false'
		}
	},
	questions = [
		{
			type: 'input',
			name: 'username',
			message: 'Username: ',
			'default': 'jraller'
		},
		{
			type: 'password',
			name: 'password',
			message: 'Password: '
		},
		{
			type: 'input',
			name: 'siteName',
			message: 'Sitename: ',
			'default': 'Jason'
		},
		{
			type: 'input',
			name: 'pagePath',
			message: 'page path: ',
			'default': 'to-edit'
		}
	];

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

function readPage() {
	client.read(soapArgs, function (err, response) {
		if (err) {
			grunt.log.writeln('Error reading page: ' + err.message);
			die();
			next(done);
		} else {
			grunt.log.writeln('page returned:');
			if (response.readReturn.success.toString() === 'true') {
//				grunt.log.writeflags(response.readReturn.asset.page);
//				console.log(response.readReturn.asset.page.structuredData.structuredDataNodes.structuredDataNode[0].text);
				response.readReturn.asset.page.structuredData.structuredDataNodes.structuredDataNode[0].text += '0';
				delete soapArgs.identifier;
				soapArgs.asset = {}
				soapArgs.asset.page = response.readReturn.asset.page;
/*
				delete soapArgs.asset.page.metadata.endDate;
				delete soapArgs.asset.page.metadata.reviewDate;
				delete soapArgs.asset.page.metadata.startDate;
				delete soapArgs.asset.page.lastPublishedDate;
*/		
//				grunt.log.writeflags(soapArgs);

				grunt.log.writeln('pre-edit');
				client.edit(soapArgs, function (err, response) {
					if (err) {
						grunt.log.writeln('Error editing page: ' + err.message);

//						grunt.log.writeln(client.lastRequest); //.replace(/>/g, '>\n')

						die();
						next(done);						
					} else {
						grunt.log.writeln('post-edit');
						
						grunt.log.writeln('response:');
						grunt.log.writeflags(response);
					}
				});
			} else {
				grunt.log.writeln(response.readReturn.message);
			}
		}
	});

}

function createClient() {
	var url = grunt.config('cascade.server'),
		ws = grunt.config('cascade.ws');
	soap.createClient(url + ws, function (err, clientObj) {
		if (err) {
			handleError(err, 'createClient');
		} else {
			grunt.log.writeln('Client created');
			client = clientObj; // here we save the client out as a global object that survives between callbacks
			next();
		}
	});
}

function bugUser() {
	inquirer.prompt(questions, function (answers) {
		soapArgs.authentication.username = answers.username;
		soapArgs.authentication.password = answers.password;
		soapArgs.identifier.path.siteName = answers.siteName;
		soapArgs.identifier.path.path = answers.pagePath;
		next();
	});
}

module.exports = function (gruntObj) {
	gruntObj.registerTask('edit-page-dd', 'call the read action for the default connector container', function () {
		grunt = gruntObj;
		done = this.async();
		next([
			[bugUser], // these need to modify global variables
			[createClient],
			[readPage], // we will call readDefaultContainer when we pick a site
			// edit page
			[report, 'all our tasks are done'],
			[done] // when we get finished doing our thing we let grunt know we are done
		]);
	});
};
