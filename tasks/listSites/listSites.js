/*jslint node:true */

'use strict';

var soap = require('soap-cascade'),
	url = 'http://conference.cascadeserver.com',
	ws = '/ws/services/AssetOperationService?wsdl',
	soapArgs = { // we need to send authentication to the server, so we start building an object to hold username and password, later more things will go in here
		authentication: { // note that the password entry comes before the username entry. Cascade can be picky about the order it sees things in. I suspect that in this case it was alphabetical.
			password: 'password', // but who wants to put a password into a file like this? see listSites2.js for the solution
			username: 'username'
		}
	};

soap.createClient(url + ws, function (err, client) {
	if (err) {
		console.log('Error creating client: ');
		console.dir(err);
	} else {
		console.log('Client created');
		// note that client a local variable to this anonymous function, later we will assign it to a global variable
		client.listSites(soapArgs, function (err, response) { // the client object knows which server to go to
			if (err) {
				console.log('Error listing sites: ');
				console.dir(err);
			} else {
				if (response.listSitesReturn.success === 'true') {
					console.log('Sites: ');
					console.dir(response.listSitesReturn);
				} else {
					console.log('Cascade responded with: ');
					console.log(response.listSitesReturn.message);
				}
			}
		});
	}
});
