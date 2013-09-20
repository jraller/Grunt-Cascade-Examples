/*jslint node:true */

/*
 * Building on listSites.js we add a module that supports accepting input from the user. This will allow us to avoid storing the username and password.
 */

'use strict';

module.exports = function (grunt) {
	grunt.registerTask('listsites2', 'call the listSites action with better output', function () {

		var done = this.async(),
			soap = require('soap-cascade'),
			inquirer = require('inquirer'), // this is the module that lets us provide an onscreen prompt to the user and retrieve the answers
			url = grunt.config('cascade.server'),
			ws = grunt.config('cascade.ws'),
			soapArgs = {
				authentication: {
					password: '',
					username: ''
				}
			},
			questions = [ // this is the set of questions we want the user to answer
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

		inquirer.prompt(questions, function (answers) { // before calling createClient we can get the questions answered
			soapArgs.authentication.username = answers.username; // and transfer the resulting answers into the soapArgs object
			soapArgs.authentication.password = answers.password;

			soap.createClient(url + ws, function (err, client) {
				if (err) {
					grunt.log.writeln('Error creating client: ');
					grunt.log.writeflags(err);
					done();
				} else {
					grunt.log.writeln('Client created');
					// note that client a local variable to this anonymous function, later we will assign it to a global variable
					client.listSites(soapArgs, function (err, response) { // the client object knows which server to go to
						var format = 'short'; // in a future version we can prompt the user if they want the long or short version of the output
						if (err) {
							grunt.log.writeln('Error listing sites: ');
							grunt.log.writeflags(err);
						} else {
							if (response.listSitesReturn.success.toString() === 'true') {
								grunt.log.writeln('Sites: ');
								response.listSitesReturn.sites.assetIdentifier.forEach(function (site) { // note that the response contains an object with the same name as the call followed by 'Return' and that we can traverse the object.
									if (format === 'long') {
										grunt.log.writeflags(site);
									} else {
										grunt.log.writeln(site.path.path);
									}
								});
							} else {
								grunt.log.writeln('Cascade responded with: ');
								grunt.log.writeln(response.listSitesReturn.message);
							}
						}
						done();
					});
				}
			});
		});
	});
};
