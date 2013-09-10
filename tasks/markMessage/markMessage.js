/*jslint node:true */

'use strict';

/*

REWRITE

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
	readStatusFlip,
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
			type: 'list',
			name: 'readStatus',
			message: 'Set to:',
			choices: ['unread', 'read']
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

function markMessage(messageId) {
	soapArgs.identifier = {};
	soapArgs.identifier.id = messageId;
	soapArgs.identifier.type = 'message';
	soapArgs.markType = readStatusFlip;
	client.markMessage(soapArgs, function (err, response) {
		if (err) {
			handleError(err, 'markMessage');
		} else {
			if (response.markMessageReturn.success.toString() === 'true') {
				report('message ' + messageId + ' was set to ' + readStatusFlip);
			} else {
				report('there was a problem with the message ' + messageId + ' which responded with: ' + response.markMessageReturn.message);
			}
		}
	});
}

function listMessages() {
	client.listMessages(soapArgs, function (err, response) {
		var calls = [];
		if (err) {
			handleError(err, 'listMessages');
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
						calls.push([markMessage, message.id]);
					});
					next(calls);
				}
			} else {
				grunt.log.writeln('Failed to return messages: ' + response.listMessagesReturn.message);
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
		readStatusFlip = answers.readStatus;
		next();
	});
}

module.exports = function (gruntObj) {
	gruntObj.registerTask('markmessage', 'mark messages read or unread', function () {
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
