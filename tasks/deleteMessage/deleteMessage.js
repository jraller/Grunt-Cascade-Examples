/*jslint node:true */

'use strict';

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

function deleteMessage(messageId) {
	soapArgs.identifier = {};
	soapArgs.identifier.id = messageId;
	soapArgs.identifier.type = 'message';
	client.deleteMessage(soapArgs, function (err, response) {
		if (err) {
			handleError(err, 'deleteMessage');
		} else {
			if (response.deleteMessageReturn.success.toString() === 'true') {
				report('message ' + messageId + ' was deleted');
			} else {
				report('there was a problem with the message ' + messageId + ' which responded with: ' + response.deleteMessageReturn.message);
			}
		}
	});
}

function listMessages() {
	client.listMessages(soapArgs, function (err, response) {
		var calls = [],
			i = 0;
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
						calls[i++] = [deleteMessage, message.id];
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
			grunt.log.writeln('Error creating client: ' + err.message);
			die();
			next(done);
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
		next();
	});
}

module.exports = function (gruntObj) {
	gruntObj.registerTask('deletemessage', 'deletes all messages', function () {
		grunt = gruntObj;
		done = this.async();
		next([
			[report, 'THIS WILL DELETE ALL THE MESSAGES for the credentials you supply'],
			[bugUser], // these need to modify global variables
			[createClient],
			[listMessages], // we will call readDefaultContainer when we pick a site
			[report, 'all our tasks are done'],
			[done] // when we get finished doing our thing we let grunt know we are done
		]);
	});
};
