/*jslint node:true */

'use strict';

var soap = require('soap-cascade'),
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
			console.log('Error creating client: ');
			console.dir(err);
		} else {
			console.log('Client created');
			// note that client a local variable to this anonymous function, later we will assign it to a global variable
			client.listSites(soapArgs, function (err, response) { // the client object knows which server to go to
				var format = 'short';
				if (err) {
					console.log('Error listing sites: ');
					console.dir(err);
				} else {
					if (response.listSitesReturn.success === 'true') {
						console.log('Sites: ');
						response.listSitesReturn.sites.assetIdentifier.forEach(function (site) {
							if (format === 'long') {
								console.dir(site);
							} else {
								console.log(site.path.path);
							}
						});
					} else {
						console.log('Cascade responded with: ');
						console.log(response.listSitesReturn.message);
					}
				}
			});
		}
	});
});

