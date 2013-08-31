/*jslint node:true */

'use strict';

module.exports = function (grunt) {
	grunt.registerTask('readassetfactorycontainer', 'call the read action to the default asset factory folder', function () {

		var done = this.async(),
			soap = require('soap-cascade'),
			inquirer = require('inquirer'),
			url = 'http://conference.cascadeserver.com',
			ws = '/ws/services/AssetOperationService?wsdl',
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
					client.listSites({authentication: soapArgs.authentication}, function(err, response) {
						if (err) {
							grunt.log.writeln('Error finding first site: ' + err.message);
							grunt.log.writeflags(err);
							done();
						} else {
							soapArgs.identifier.path.siteName = response.listSitesReturn.sites.assetIdentifier[0].path.path; // extract the first site from the list of sites
							client.read(soapArgs, function (err, response) {
								if (err) {
									grunt.log.writeln('Error reading asset factory container: ');
									grunt.log.writeln(err.message);
									grunt.log.writeflags(err);
								} else {
									if (response.readReturn.success.toString() === 'true') {
										grunt.log.writeln('AssetFactoryContainer: '); // you will note we are heavily nested at this point, this is a good time to use next() and continuous passing style
										response.readReturn.asset.assetFactoryContainer.children.child.forEach(function (child) {
											grunt.log.writeln(child.path.path + ' - ' + child.type);
										});
									} else {
										grunt.log.writeln('Cascade responded with: ');
										grunt.log.writeln(response.readReturn.message);
									}
								}
								done();
							});
						}
					});
				}
			});
		});
	});
};
