/*jslint node:true */

'use strict';

// list messages for current user
//handle none, one, many

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

function handleError(err) {
	die(); // this error handler is not designed for recovery, but graceful exiting, so we die and then display the error message and let Grunt exit
	next([
		[report, handleError.caller.name + ' responded with: ' + err.message],
		[done]
	]);
}

function listMessages() {
	client.listMessages(soapArgs, function (err, response) {
		if (err) {
			grunt.log.writeln('Error listing Messages: ' + err.message);
			die();
			next(done);
		} else {
			grunt.log.writeln('Messages returned:');
			if (response.listMessagesReturn.success.toString() === 'true') {
				grunt.log.writeflags(response.listMessagesReturn);
				if (!response.listMessagesReturn.messages.message) {
					// messages: {}, - no messages
					grunt.log.writeln('There were no messages');
				} else {
					grunt.log.writeln('There was at least one message');
					if (!Array.isArray(response.listMessagesReturn.messages.message)) {
						// messages: {message: {}},
						grunt.log.writeln('There was exactly one message');
						response.listMessagesReturn.messages.message = [response.listMessagesReturn.messages.message];
					} else {
						// messages: {message: []},
						grunt.log.writeln('There were more than one message');
					}
					response.listMessagesReturn.messages.message.forEach(function (message) {
						grunt.log.writeln('From: ' + message.from);
						grunt.log.writeln('To: ' + message.to);
						grunt.log.writeln('Subject: ' + message.subject);
						grunt.log.writeln('Date: ' + message.date);
						grunt.log.writeln('Body: ' + message.body);
					});
				}
			} else {
				grunt.log.writeln('Failed to return messages: ' + response.listMessagesReturn.message);
			}
			next();
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
		next();
	});
}

module.exports = function (gruntObj) {
	gruntObj.registerTask('listmessages', 'call the read action for the default connector container', function () {
		grunt = gruntObj;
		done = this.async();
		next([
			[bugUser],
			[createClient],
			[listMessages],
			[report, 'all our tasks are done'],
			[done]
		]);
	});
};
