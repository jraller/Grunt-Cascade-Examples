/*jslint node:true */ // tell jslint that this code is for NodeJS

'use strict'; // putting JavaScript into strict mode will force us to write better code

module.exports = function (grunt) { // a wrapper to put this in 
	grunt.registerTask('client', 'demonstrate calling the client', function () { // the code inside this function is what is run when you type grunt client
		var soap = require('soap-cascade'), // this is the way in which the soap-cascade library is pulled in to the current context.
			url = grunt.config('cascade.server'), // these pull from Gruntfile.js at the root level
			ws = grunt.config('cascade.ws'),
			done = this.async(); // because we are using asynchronous calls we need to tell Grunt to wait to finish execution until we call done()

		soap.createClient(url + ws, function (err, client) { // using the url and the web services path fetch the WSDL and generate either an error or a client object
			if (err) {
				grunt.log.writeln('Error: '); // make clear on the console that we are going to display an error. If writing for NodeJS directly use console.log
				grunt.log.writeflags(err); // if there was an error take the err object and display it to the console
				done();
			} else {
				grunt.log.writeln('Client created: ');
				grunt.log.writeflags(client); // we now have a client to work with
				done();
			}
		});
	});
};