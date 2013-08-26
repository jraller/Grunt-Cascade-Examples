/*jslint node:true */

'use strict';

var soap = require('soap-cascade'),
	url = 'http://conference.cascadeserver.com',
	ws = '/ws/services/AssetOperationService?wsdl';

soap.createClient(url + ws, function (err, client) {
	if (err) {
		console.log('Error: ');
		console.dir(err);
	} else {
		console.log('Client created: ');
		console.dir(client.AssetOperationHandlerService); // here will drill into the client object to get the list of actions we can call.
		// Do not call these end points directly as they exposed at the base level of the client object. 
	}
});

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