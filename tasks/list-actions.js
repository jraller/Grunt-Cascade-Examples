/*jslint node:true */

'use strict';

module.exports = function (grunt) {
	grunt.registerTask('list-actions', 'list the actions that the client can perform', function () {
		var soap = require('soap-cascade'),
			url = grunt.config('cascade.server'),
			ws = grunt.config('cascade.ws'),
			done = this.async();

		soap.createClient(url + ws, function (err, client) {
			if (err) {
				grunt.log.writeln('Error: ');
				grunt.log.writeflags(err);
				done();
			} else {
				grunt.log.writeln('Client created: ');
				grunt.log.writeflags(client.AssetOperationHandlerService.AssetOperationService); // here will drill into the client object to get the list of actions we can call.
				// Do not call these end points directly as they exposed at the base level of the client object.
				done();
			}
		});
	});
};

/*
Client created:
{ AssetOperationService:
   { delete: [Function],
     create: [Function],
     publish: [Function],
     edit: [Function],
     batch: [Function],
     read: [Function],
     search: [Function],
     readAccessRights: [Function],
     editAccessRights: [Function],
     readWorkflowSettings: [Function],
     editWorkflowSettings: [Function],
     listSubscribers: [Function],
     listMessages: [Function],
     markMessage: [Function],
     deleteMessage: [Function],
     sendMessage: [Function],
     checkOut: [Function],
     checkIn: [Function],
     copy: [Function],
     siteCopy: [Function],
     listSites: [Function],
     move: [Function],
     readWorkflowInformation: [Function],
     readAudits: [Function],
     performWorkflowTransition: [Function] } }
*/