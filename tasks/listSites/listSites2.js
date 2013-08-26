/*jslint node:true */

'use strict';

module.exports = function (grunt) {
	grunt.registerTask('listsites2', 'call the listSites action with better output', function () {

		var done = this.async(),
			soap = require('soap-cascade'),
			inquirer = require('inquirer'),
			url = 'http://conference.cascadeserver.com',
			ws = '/ws/services/AssetOperationService?wsdl',
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

		inquirer.prompt(questions, function (answers) {
			soapArgs.authentication.username = answers.username;
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
						var format = 'short';
						if (err) {
							grunt.log.writeln('Error listing sites: ');
							grunt.log.writeflags(err);
						} else {
							if (response.listSitesReturn.success.toString() === 'true') {
								grunt.log.writeln('Sites: ');
								response.listSitesReturn.sites.assetIdentifier.forEach(function (site) {
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
