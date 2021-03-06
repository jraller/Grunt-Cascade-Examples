/*jslint node:true */

/*
 * read a page
 */

'use strict';

module.exports = function (grunt) {
	grunt.registerTask('readpage', 'call the read action to read a page from a site', function () {

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
					path: {
						path: '',
						siteId: '',
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
					'default': 'yourUsernameHereIfYouWant'
				},
				{
					type: 'password',
					name: 'password',
					message: 'Password: '
				},
				{
					type: 'input',
					name: 'site',
					message: 'Site: ',
					'default': 'Shared'
				},
				{
					type: 'input',
					name: 'path',
					message: 'path to page: ',
					'default': 'index'
				}
			];

		inquirer.prompt(questions, function (answers) {
			soapArgs.authentication.username = answers.username;
			soapArgs.authentication.password = answers.password;
			soapArgs.identifier.path.siteName = answers.site;
			soapArgs.identifier.path.path = answers.path;

			soap.createClient(url + ws, function (clientErr, client) {
				if (clientErr) {
					grunt.log.writeln('Error creating client: ');
					grunt.log.writeflags(clientErr);
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
								grunt.log.writeflags(response.readReturn.asset.page); // a raw dump of the data that makes up the user portion of the response.
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
