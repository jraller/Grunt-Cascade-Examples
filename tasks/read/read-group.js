/*jslint node:true */

/*
 * Here we start asking the user to specify which group to get information about.
 * This is a good way to let is play with the error object as it is now easy to supply input that will result in a "group not found" error message.
 */

 'use strict';

module.exports = function (grunt) {
	grunt.registerTask('readgroup', 'call the read action to read the current user', function () {

		var done = this.async(),
			soap = require('soap-cascade'),
			inquirer = require('inquirer'),
			url = grunt.config('cascade.server'),
			ws = grunt.config('cascade.ws'),
			soapArgs = {
				authentication: {
					password: '',
					username: ''
				},
				identifier: {
					id: '',
					type: 'group',
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
					name: 'groupName',
					message: 'Group: '
				}
			];

		inquirer.prompt(questions, function (answers) {
			soapArgs.authentication.username = answers.username;
			soapArgs.authentication.password = answers.password;
			soapArgs.identifier.id = answers.groupName;

			soap.createClient(url + ws, function (err, client) {
				if (err) {
					grunt.log.writeln('Error creating client: ');
					grunt.log.writeflags(err);
					done();
				} else {
					grunt.log.writeln('Client created');
					client.read(soapArgs, function (err, response) {
						if (err) {
							grunt.log.writeln('Error reading group: ');
							grunt.log.writeflags(err);
						} else {
							if (response.readReturn.success.toString() === 'true') {
								grunt.log.writeln('Group: ');
								grunt.log.writeflags(response.readReturn.asset.group);
							} else {
								grunt.log.writeln('Cascade responded with: ');
								grunt.log.writeln(response.readReturn.message); // if you specify a group that does not exist you'll see this output
							}
						}
						done();
					});
				}
			});
		});
	});
};
