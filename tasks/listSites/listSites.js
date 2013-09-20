/*jslint node:true */

/*
 * This is the first example call. listSites is a good place to start because it only requires authorization to be sent.
 */

'use strict';

module.exports = function (grunt) {
	grunt.registerTask('listsites', 'call the listSites action', function () {

		var done = this.async(),
			soap = require('soap-cascade'),
			url = grunt.config('cascade.server'),
			ws = grunt.config('cascade.ws'),
			soapArgs = { // we need to send authentication to the server, so we start building an object to hold username and password, later more things will go in here
				authentication: { // note that the password entry comes before the username entry. Cascade can be picky about the order it sees things in. I suspect that in this case it was alphabetical.
					password: 'password', // but who wants to put a password into a file like this? see listSites2.js for the solution
					username: 'username'
				}
			};

		soap.createClient(url + ws, function (err, client) {
			if (err) {
				grunt.log.writeln('Error creating client: ');
				grunt.log.writeflags(err);
				done();
			} else {
				grunt.log.writeln('Client created');
				// note that client a local variable to this anonymous function, later we will assign it to a global variable
				client.listSites(soapArgs, function (err, response) { // the client object knows which server to go to
					if (err) {
						grunt.log.writeln('Error listing sites: ');
						grunt.log.writeflags(err);
					} else {
						if (response.listSitesReturn.success.toString() === 'true') { // response calls from Cascade will have a success and a message value
							grunt.log.writeln('Sites: ');
							grunt.log.writeflags(response.listSitesReturn); // in this case we are dumping the entire object rather than processing it
						} else {
							grunt.log.writeln('Cascade responded with: ');
							grunt.log.writeln(response.listSitesReturn.message); // if success is not 'true' then usually there will be an explanation in the message
						}
					}
					done();
				});
			}
		});
	});
};
