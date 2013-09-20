/*jslint node:true */

/*
 * A little self introspection, we will get the user object for the current username and password
 */

'use strict';

module.exports = function (grunt) {
	grunt.registerTask('readuser', 'call the read action to read the current user', function () {

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
				identifier: { // we supply the framework of the second part of the soapArgs here
					id: '', // specifying it this way allows us to control the order of the parts of the object. A future refinement to soap-cascade will hopefully make this unneeded.
					type: 'user',
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

		inquirer.prompt(questions, function (answers) {
			soapArgs.authentication.username = answers.username;
			soapArgs.authentication.password = answers.password;
			soapArgs.identifier.id = answers.username;

			soap.createClient(url + ws, function (err, client) {
				if (err) {
					grunt.log.writeln('Error creating client: ');
					grunt.log.writeflags(err);
					done();
				} else {
					grunt.log.writeln('Client created');
					client.read(soapArgs, function (err, response) {
						if (err) {
							grunt.log.writeln('Error reading user: ');
							grunt.log.writeflags(err);
						} else {
							if (response.readReturn.success.toString() === 'true') {
								grunt.log.writeln('User: ');
								grunt.log.writeflags(response.readReturn.asset.user); // a raw dump of the data that makes up the user portion of the response.
							} else {
								grunt.log.writeln('Cascade responded with: ');
								grunt.log.writeln(response.readReturn.message);
							}
						}
						done();
					});
				}
			});
		});
	});
};
