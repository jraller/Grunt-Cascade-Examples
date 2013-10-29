/*jslint node:true */

'use strict';

/*

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
		},
		searchInformation: {
			matchType: 'match-any',
			assetName: '*',
			searchUsers: 'true'
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

function searchUsers() {
	client.search(soapArgs, function (err, response) {
		if (err) {
			grunt.log.writeln('Error with search: ' + err.message);
			die();
			next(done);
		} else {
			if (response.searchReturn.success.toString() === 'true') {
				if (!Array.isArray(response.searchReturn.matches.match)) {
					response.searchReturn.matches.match = [response.searchReturn.matches.match];
				}
				grunt.log.writeln(response.searchReturn.matches.match.length + ' users found');
				response.searchReturn.matches.match.forEach(function (user) {
					grunt.log.writeln(user.id);
					// or queue up users to read to get their full information here.
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
			client = clientObj;
			next();
		}
	});
}

function bugUser() {
	inquirer.prompt(questions, function (answers) {
		soapArgs.authentication.username = answers.username;
		soapArgs.authentication.password = answers.password;
		next();
	});
}

module.exports = function (gruntObj) {
	gruntObj.registerTask('searchuser', 'list all user ids', function () {
		grunt = gruntObj;
		done = this.async();
		next([
			[bugUser],
			[createClient],
			[searchUsers],
			[report, 'all our tasks are done'],
			[done]
		]);
	});
};
