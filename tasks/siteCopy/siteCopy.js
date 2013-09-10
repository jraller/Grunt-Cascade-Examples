/*jslint node:true */

'use strict';

/*
<as:siteCopy>
	<as:authentication>
		<as:password>STRING</as:password>
		<as:username>STRING</as:username>
	</as:authentication>
	<as:originalSiteId>STRING</as:originalSiteId>
	<as:originalSiteName>STRING</as:originalSiteName>
	<as:newSiteName>STRING</as:newSiteName>
</as:siteCopy>
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
		identifier: {
			path: {
				path: '',
				siteName: ''
			},
			type: 'connectorcontainer',
			recycled: 'false'
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
		},
		{
			type: 'input',
			name: 'connectorContainerName',
			message: 'connector folder name: ',
			'default': '/'
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

function readConnectorContainer() {
	client.read(soapArgs, function (err, response) {
		if (err) {
			grunt.log.writeln('Error finding connector container: ' + err.message);
			die();
			next(done);
		} else {
			grunt.log.writeln('connector containers returned:');
			if (response.readReturn.success.toString() === 'true') {
				grunt.log.writeln('connector containers named ' + response.readReturn.asset.connectorContainer.name);
				if (response.readReturn.asset.connectorContainer.children && response.readReturn.asset.connectorContainer.children.child) {
					if (!Array.isArray(response.readReturn.asset.connectorContainer.children.child)) {
						response.readReturn.asset.connectorContainer.children.child = [response.readReturn.asset.connectorContainer.children.child];
					}
					response.readReturn.asset.connectorContainer.children.child.forEach(function (child) {
						grunt.log.writeln('connector named ' + child.path.path + ' of type ' + child.type);
					});
				} else {
					grunt.log.writeln('it was empty of connectors');
				}
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
		soapArgs.identifier.path.path = answers.connectorContainerName;
		next();
	});
}

module.exports = function (gruntObj) {
	gruntObj.registerTask('sitecopy', 'call the read action for the default connector container', function () {
		grunt = gruntObj;
		done = this.async();
		next([
			[bugUser], // these need to modify global variables
			[createClient],
			[readConnectorContainer], // we will call readDefaultContainer when we pick a site
			[report, 'all our tasks are done'],
			[done] // when we get finished doing our thing we let grunt know we are done
		]);
	});
};
