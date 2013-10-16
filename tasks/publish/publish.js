/*jslint node:true */

'use strict';

/*
 * For this example we set up to publish an entire site
 * in addition to getting username, password, and site name we will need to interrogate the server for destinations that we might publish to.
 * This will allow us to demonstrate branching logic using next()
 */

/*
var soapArgsForpublish = {
  authentication: {
    password: '',  // xsd:string
    username: ''  // xsd:string
  },
  publishInformation: {
    // Identifier of the asset being published REQUIRED
    identifier: {
      // When editing and selected asset is recycled, it is recommended to preserve this relationship by providing selected asset's id in case if the selected asset gets restored from the recycle bin. One is REQUIRED
      id: '',  // xsd:string
      // Path works only for non-recycled assets
      path: {
        // When reading a site, the "path" element should be populated with the site's name
        path: '',  // xsd:string
        // NOT REQUIRED
        siteId: '',  // xsd:string nillable
        siteName: ''  // xsd:string nillable
      },
      type: '',  //  one of: 'assetfactory', 'assetfactorycontainer', 'block', 'block_FEED', 'block_INDEX', 'block_TEXT', 'block_XHTML_DATADEFINITION', 'block_XML', 'block_TWITTER_FEED', 'connectorcontainer', 'twitterconnector', 'facebookconnector', 'wordpressconnector', 'googleanalyticsconnector', 'contenttype', 'contenttypecontainer', 'destination', 'file', 'folder', 'group', 'message', 'metadataset', 'metadatasetcontainer', 'page', 'pageconfigurationset', 'pageconfiguration', 'pageregion', 'pageconfigurationsetcontainer', 'publishset', 'publishsetcontainer', 'reference', 'role', 'datadefinition', 'datadefinitioncontainer', 'format', 'format_XSLT', 'format_SCRIPT', 'site', 'sitedestinationcontainer', 'symlink', 'target', 'template', 'transport', 'transport_fs', 'transport_ftp', 'transport_db', 'transportcontainer', 'user', 'workflow', 'workflowdefinition', 'workflowdefinitioncontainer' 
      // NOT REQUIRED: For reading purposes only. Ignored when editing, copying etc.
      recycled: 'false'  // xsd:boolean
    },
    // This field is Ignored when identifier (above) points to a Destination Publishing an asset that does not allow you to select Destinations in the Cascade UI (Publish Set or Target) *will* respect the Destinations supplied here (this is an inconsistency between the UI and web services). Supplying an empty set of identifiers will publish to all Destinations that are enabled and applicable for the user making the web services call.
    destinations: {
      assetIdentifier: [{
        // When editing and selected asset is recycled, it is recommended to preserve this relationship by providing selected asset's id in case if the selected asset gets restored from the recycle bin. One is REQUIRED
        id: '',  // xsd:string
        // Path works only for non-recycled assets
        path: {
          // When reading a site, the "path" element should be populated with the site's name
          path: '',  // xsd:string
          // NOT REQUIRED
          siteId: '',  // xsd:string nillable
          siteName: ''  // xsd:string nillable
        },
        type: '',  //  one of: 'assetfactory', 'assetfactorycontainer', 'block', 'block_FEED', 'block_INDEX', 'block_TEXT', 'block_XHTML_DATADEFINITION', 'block_XML', 'block_TWITTER_FEED', 'connectorcontainer', 'twitterconnector', 'facebookconnector', 'wordpressconnector', 'googleanalyticsconnector', 'contenttype', 'contenttypecontainer', 'destination', 'file', 'folder', 'group', 'message', 'metadataset', 'metadatasetcontainer', 'page', 'pageconfigurationset', 'pageconfiguration', 'pageregion', 'pageconfigurationsetcontainer', 'publishset', 'publishsetcontainer', 'reference', 'role', 'datadefinition', 'datadefinitioncontainer', 'format', 'format_XSLT', 'format_SCRIPT', 'site', 'sitedestinationcontainer', 'symlink', 'target', 'template', 'transport', 'transport_fs', 'transport_ftp', 'transport_db', 'transportcontainer', 'user', 'workflow', 'workflowdefinition', 'workflowdefinitioncontainer' 
        /* NOT REQUIRED: For reading purposes only. Ignored when editing, copying etc.
        recycled: 'false'  // xsd:boolean
      }]
    },
    /* Similar to the GUI - you can choose to unpublish the asset instead of publishing it. Not required. Default: false
    unpublish: 'false'  // xsd:boolean nillable
  }
};
*/


/*
<as:authentication>
	<as:password>STRING</as:password>
	<as:username>STRING</as:username>
</as:authentication>
<as:publishInformation>
	<as:identifier>
		<as:id>STRING</as:id>
		<as:path>
			<as:path>STRING</as:path>
			<as:siteId/>
			<as:siteName/>
		</as:path>
		<as:type>ENTITYTYPESTRING</as:type>
		<as:recycled>BOOLEAN</as:recycled>
	</as:identifier>
	<as:destinations>
		<as:assetIdentifier>
			<as:id>STRING</as:id>
			<as:path>
				<as:path>STRING</as:path>
				<as:siteId/>
				<as:siteName/>
			</as:path>
			<as:type>ENTITYTYPESTRING</as:type>
			<as:recycled>BOOLEAN</as:recycled>
		</as:assetIdentifier>
	</as:destinations>
	<as:unpublish/>
</as:publishInformation>
*/



var grunt = {},
	done,
	nextList = [],
	soap = require('soap-cascade'),
	client = {},
	inquirer = require('inquirer'),
	soapArgs = {
		authentication: {
			password: '',
			username: ''
		},
		identifier: {
			path: {
				path: '',
				siteName: ''
			},
			type: 'connectorcontainer',
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
		},
		{
			type: 'input',
			name: 'siteName',
			message: 'Sitename: '
		},
		{
			type: 'input',
			name: 'connectorContainerName',
			message: 'connector folder name: ',
			'default': '/'
		}
	];

function next() {
	var todo,
		current,
		task,
		args = {};
	if (arguments.length > 0) {
		if (!Array.isArray(arguments['0'])) {
			todo = [arguments];
		} else {
			todo = [];
			arguments['0'].forEach(function (item) {
				todo.push(item);
			});
		}
		nextList = todo.concat(nextList);
	}
	if (nextList.length > 0) {
		current = Array.prototype.slice.apply(nextList.shift());
		task = current[0];
		args = current.slice(1);
		task.apply(null, args);
	}
}

function die() {
	nextList = [];
}

function report(message) {
	if (typeof message === 'string') {
		grunt.log.writeln(message);
	} else {
		console.dir(message);
	}
	next();
}

function handleError(err, caller) {
	die();
	if (!caller) {
		caller = 'A function';
	}
	next([
		[report, caller + ' responded with: ' + err.message],
		[done]
	]);
}

function readConnectorContainer() {
	client.read(soapArgs, function (err, response) {
		if (err) {
			grunt.log.writeln('Error finding connector container: ' + err.message);
			die();
			next(done);
		} else {
			grunt.log.writeln('connector containers returned:');
			if (response.readReturn.success.toString() === 'true') {
				grunt.log.writeln('connector containers named ' + response.readReturn.asset.connectorContainer.name);
				if (response.readReturn.asset.connectorContainer.children && response.readReturn.asset.connectorContainer.children.child) {
					if (!Array.isArray(response.readReturn.asset.connectorContainer.children.child)) {
						response.readReturn.asset.connectorContainer.children.child = [response.readReturn.asset.connectorContainer.children.child];
					}
					response.readReturn.asset.connectorContainer.children.child.forEach(function (child) {
						grunt.log.writeln('connector named ' + child.path.path + ' of type ' + child.type);
					});
				} else {
					grunt.log.writeln('it was empty of connectors');
				}
			} else {
				grunt.log.writeln(response.readReturn.message);
			}
		}
	});
}

function createClient() {
	var url = grunt.config('cascade.server'),
		ws = grunt.config('cascade.ws');
	soap.createClient(url + ws, function (err, clientObj) {
		if (err) {
			handleError(err, 'createClient');
		} else {
			grunt.log.writeln('Client created');
			client = clientObj; // here we save the client out as a global object that survives between callbacks
			next();
		}
	});
}

function bugUser() {
	inquirer.prompt(questions, function (answers) {
		soapArgs.authentication.username = answers.username;
		soapArgs.authentication.password = answers.password;
		soapArgs.identifier.path.siteName = answers.siteName;
		soapArgs.identifier.path.path = answers.connectorContainerName;
		next();
	});
}

module.exports = function (gruntObj) {
	gruntObj.registerTask('publish', 'call the read action for the default connector container', function () {
		grunt = gruntObj;
		done = this.async();
		next([
			[bugUser], // these need to modify global variables
			[createClient],
			[readConnectorContainer], // we will call readDefaultContainer when we pick a site
			[report, 'all our tasks are done'],
			[done] // when we get finished doing our thing we let grunt know we are done
		]);
	});
};
