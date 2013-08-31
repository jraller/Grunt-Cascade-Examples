/*jslint node:true */

'use strict';

var grunt = {},
	done,
	nextList = [], // the global that will hold our stack of tasks
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
				path: 'Default',
				siteName: ''
			},
			type: 'assetfactorycontainer',
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
		}
	];

function next() {
	var todo, // for processing the incoming task(s)
		current, // stores the task to be executed
		task, // the function to call for the task to run
		args = {}; // the arguments to call for the task to run
	if (arguments.length > 0) { // check if next was called with any tasks to add to the stack
		if (!Array.isArray(arguments['0'])) { // if it was called with a single task
			todo = [arguments]; // put the task into an array
		} else { // break out the array // else it was called with an array of tasks
			todo = []; // empty todo
			arguments['0'].forEach(function (item) { //for each task in the arguments
				todo.push(item); // put that task into todo
			});
		}
		nextList = todo.concat(nextList); // append our current todo to the front of the stack
	}
	if (nextList.length > 0) { // if there are things to do on the stack
		current = Array.prototype.slice.apply(nextList.shift()); // grab the top item
		task = current[0]; // break the current item out into its function call
		args = current.slice(1); // and the arguments if any for that function call
		task.apply(null, args); // and then call it.
	}
}

function die() {
	nextList = []; //clear out any other tasks we have planned as we have hit an error
}

function readAssetFactory(path) {
	soapArgs.identifier.path.path = path;
	soapArgs.identifier.type = 'assetfactory';
	client.read(soapArgs, function (err, response) {
		if (err) {
			grunt.log.writeln('Error reading ' + path + ' ' + err.message);
			die();
			next(done);
		} else {
//			grunt.log.writeflags(response.readReturn.asset.assetFactory);
			grunt.log.writeln(response.readReturn.asset.assetFactory.name + ' has a workflow of ' + response.readReturn.asset.assetFactory.workflowMode);
			next();
		}
	});
}

// readDefaultContainer will call readAssetFactory once for each assetFactory it contains
function readDefaultContainer(siteNamePassed) {
	soapArgs.identifier.path.siteName = siteNamePassed; // we catch the passed variable
	client.read(soapArgs, function (err, response) {
		var calls = [],
			i = 0;
		if (err) {
			grunt.log.writeln('Error reading asset factory container: ' +  err.message);
			die();
			next(done);
		} else {
			if (response.readReturn.success.toString() === 'true') {
				grunt.log.writeln('AssetFactoryContainer: ');
				response.readReturn.asset.assetFactoryContainer.children.child.forEach(function (child) {
//					grunt.log.writeln(child.path.path + ' - ' + child.type);
					calls[i++] = [readAssetFactory, child.path.path];
				});
				next(calls);
			} else {
				grunt.log.writeln('Cascade responded with: ');
				grunt.log.writeln(response.readReturn.message);
				die();
				next(done);
			}
		}
	});
}

function listSites() {
	client.listSites({authentication: soapArgs.authentication}, function (err, response) { // we strip out from soapArgs just the part we need
		if (err) {
			grunt.log.writeln('Error finding first site: ' + err.message);
			die();
			next(done);
		} else {
			grunt.log.writeln('listSites returned');
			next(readDefaultContainer, response.listSitesReturn.sites.assetIdentifier[0].path.path);
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
	gruntObj.registerTask('readassetfactory', 'call the read action and get several asset factories', function () {
		grunt = gruntObj;
		done = this.async();
		next([
			[bugUser], // these need to modify global variables
			[createClient],
			[listSites], // we will call readDefaultContainer when we pick a site
			[grunt.log.writeln, 'all our tasks are done'],
			[done] // when we get finished doing our thing we let grunt know we are done
		]);
	});
};
