/*jslint node:true */ // tell jslint that this code is for NodeJS

'use strict'; // putting JavaScript into strict mode will force us to write better code

var soap = require('soap-cascade'), // this is the way in which the soap-cascade library is pulled in to the current context.
	url = 'http://conference.cascadeserver.com', // within the quotes put the full url of your cascade server
	ws = '/ws/services/AssetOperationService?wsdl'; // this is the extension that gets added to your cascade server

soap.createClient(url + ws, function (err, client) { // using the url and the web services path fetch the WSDL and generate either an error or a client object
	if (err) {
		console.log('Error: '); // make clear on the console that we are going to display an error
		console.dir(err); // if there was an error take the err object and display it to the console
	} else {
		console.log('Client created: ');
		console.dir(client); // we now have a client to work with
	}
});