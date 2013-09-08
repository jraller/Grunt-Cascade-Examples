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
		},
		message: {
			to: '',
			from: '',
			subject: '',
			body: ''
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
			name: 'subject',
			message: 'Subject: '
		},
		{
			type: 'input',
			name: 'body',
			message: 'Body: '
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

function spam() {
	client.sendMessage(soapArgs, function (err, response) {
		if (err) {
			grunt.log.writeln('Error sending message: ' + err.message);
			die();
			next(done);
		} else {
			if (response.sendMessageReturn.success.toString() === 'true') {
				grunt.log.writeln('Message sent');
			} else {
				grunt.log.writeln('Failed to send message:' + response.sendMessageReturn.message);
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
		soapArgs.message.to = answers.username;
		soapArgs.message.from = answers.username;
		soapArgs.message.subject = answers.subject;
		soapArgs.message.body = answers.body; // you can send html if you encode it correctly turn < into &lt;
		next();
	});
}

module.exports = function (gruntObj) {
	gruntObj.registerTask('sendmessage', 'spam ourself', function () {
		grunt = gruntObj;
		done = this.async();
		next([
			[bugUser],
			[createClient],
			[spam],
			[report, 'all our tasks are done'],
			[done]
		]);
	});
};
