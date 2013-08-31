Grunt-Cascade-Examples
======================

a set of examples and test code for accessing [Cascade Server](http://www.hannonhill.com/) 
[Web Services](http://www.hannonhill.com/kb/Web-Services/) in [NodeJS](http://nodejs.org/).

Right now these calls are being written to target version 7.6. 
See the [web services changelog](http://www.hannonhill.com/kb/Web-Services/Web%20Services%20Changelog/index.html) 
You may need to adjust the code to work with other versions.

Clone this repository to your workstation.
Run `npm install` to populate the `node_modules` folder.
Edit `Gruntfile.js` and modify the url for your **TEST** Cascade Server - do not use this with your production instance.
Review the code - here you will find examples of each of the web service calls you might 
make with documentation and notes about quirks for each call.
Run the tests - will document as they are written.

To run the first test for instance: `grunt client`

# Lessons and Commentary

## createClient

Creating a client connection to the server is the first step.
A `client` object is one of the arguments of the callback, but can be assigned to a global variable.
The client object contains all the addressing information and generated functions for each of the Cascade WS actions.

`createClient(urlForWSDL, function (err, client) {})`

* `grunt client` will run tasks/client.js, the base example that other examples build on
* `grunt list-actions` will run tasks/list-actions.js and show an unformatted list of supported actions

## Cascade Specific

The following are the functions generated by `createClient`:

### listSites

`listSites` will return an array of objects describing the sites on the server. 
Note the nesting of the `listSites` call within the `createClient` call.

* `grunt listsites` will run listSites/listSites.js -- setting up our first call. Introduces authentication.
* `grunt listsites2` will run listSites/listSites2.js -- adding prompt and starting to work with objects

### read

With read comes the need to introduce `next();` and the concept of continous passing style. 
NodeJS will continue execution of a file even after reaching the end if it detects that the 
code is waiting for an asynchronous callback to complete. We can take advantage of this to 
control the order of multiple client calls. A simple example is that if we want to edit an 
asset the first thing we might want to do is send a `read` call, but then we would need to 
choose to either call `create` or `edit` based on the existence of the asset.

```
var nextList = []; // the global that will hold our stack of tasks

function next() {
	var todo, // for processing the incoming task(s)
		current, // stores the task to be executed
		task, // the function to call for the task to run
		args = {}; // the arguments to call for the task to run
	if (arguments.length > 0) { // check if next was called with any tasks to add to the stack
		if (!Array.isArray(arguments['0'])) { // if it was called with a single task
			todo = [arguments]; // put the task into an array
		} else { // break out the array // else it was called with an array of tasks
			todo = []; // empty todo
			arguments['0'].forEach(function (item) { //for each task in the arguments
				todo.push(item); // put that task into todo
			});
		}
		nextList = todo.concat(nextList); // append our current todo to the front of the stack
	}
	if (nextList.length > 0) { // if there are things to do on the stack
		current = Array.prototype.slice.apply(nextList.shift()); // grab the top item
		task = current[0]; // break the current item out into its function call
		args = current.slice(1); // and the arguments if any for that function call
		task.apply(null, args); // and then call it.
	}
}
```

Later we will add the ability to add items to `nextList` without triggering the calling of the next task. 
This allows for processes like creating a deep path of folders.

A simple `read` might have soapArgs that include the following along with authentication:

```
identifier: {
  path: {
    path: '/robots.txt',
    siteName: 'example'
  },
  type: 'file',
  recycled: 'false'
}
```

It is also possible to address assets by id and siteid rather than by name. 
If you are making a series of calls you might start with name and then switch 
to using id once you've obtained them.

Interpreting the returned value of a read is going to be asset type dependant.

#### assetFactory
#### assetFactoryContainer
#### connectorContainer
#### contentType
#### contentTypeContainer
#### dataDefinition
#### dataDefinitionContainer
#### databaseTransport
#### destination
#### facebookConnector
#### feedBlock
#### file
#### fileSystemTransport
#### folder
#### ftpTransport
#### googleAnalyticsConnector
#### group

* `grunt readgroup` will run read/read-group.js

```
identifier: {
  id: 'groupName',
  type: 'group',
  recycled: 'false'
}
```

#### indexBlock
#### metadataSet
#### metadataSetContainer
#### page
#### pageConfigurationSet
#### pageConfigurationSetContainer
#### publishSet
#### publishSetContainer
#### reference
#### role
#### scriptFormat
#### site

```
identifier: {
  path: {
    path: 'SiteName'
  },
  type: , 'site'
}
```
or

```
identifier: {
  id: 'siteIdString'
  type: , 'site'
}
```

#### siteDestinationContainer
#### symlink
#### target
#### template
#### textBlock
#### transportContainer
#### twitterConnector
#### twitterFeedBlock

#### user

* `grunt readuser` will run read/read-user.js

reading users can be accomplished with authentication and :

```
identifier: {
	id: '', // where id is the username of the user
	type: 'user',
	recycled: 'false'
}
```

This will return an object like:

```
authType = "normal", // this is where LDAP would be specified
defaultGroup = {}, // if one is set
defaultSiteId = "IdString",
defaultSiteName = "Jason",
email = {},
enabled = "true",
fullName = "Jason Aller",
groups = "Administrators;ALL_USERS",
password = "passwordHash",
role = "Administrator",
username = "jraller"
```

#### wordPressConnector
#### workflowConfiguration
#### workflowDefinition
#### workflowDefinitionContainer
#### xhtmlDataDefinitionBlock
#### xmlBlock
#### xsltFormat

### create

For different assets the call needs different soap arguments.

#### folder
```
asset {
  folder: {
    name: 'folderName',
    parentFolderPath: 'nameOfParentFolder',
    siteName: 'example'
  }
}
```

#### file

```
asset {
  file: {
    name: 'fileName',
    parentFolderPath: 'nameOfParentFolder',
    siteName: 'example',
    data: fs.readFileSync(localDiskPath, {encoding: 'base64'})
  }
}
```

file can also accept `text` instead of `data`.

```
asset {
  file: {
    name: 'fileName',
    parentFolderPath: 'nameOfParentFolder',
    siteName: 'example',
    text: 'the content of the file'
  }
}
```


### delete

Remove an asset from the server.

### publish

Trigger a publish

### edit

When calling `edit` it usually makes sense to first call `read`, but beware that you may 
have to make changes to the structure of your soapArgs.

### batch

Allows you to string together multiple calls.

### search

Get a list of assets from the server.

#### user

demo not coded yet.

```
searchInformation: {
  matchType: 'match-any',
  assetName: '*e*', // to search for usernames that start with the letter e, case insensitive
  searchUsers: 'true'
}
```

### readAccessRights

For a given asset get the access rights for that asset.

### editAccessRights

One of the gotcha soapArg cases in that when you supply an `aclEntry` it must be in the order:
 * `level` 
 * `type`
 * `name`

Another gotcha appears to be that if you send an editAccessRights call that trys to apply the 
existing permissions to an asset then the callback is never fired because the server doesn't 
respond. Read the access rights first, compare, if there will be changed then call edit acccess rights.
It remains to be seen which versions of Cascade Server behave this way, or if this will be fixes.

### copy

Make a copy of an asset.

### siteCopy

Copy a site.

### move

Move or rename an asset.

### readWorkflowSettings

N/A

### editWorkflowSettings

N/A

### listSubscribers

N/A

### listMessages

N/A

### markMessage

N/A

### deleteMessage

N/A

### sendMessage

N/A

### checkOut

N/A

### checkIn

N/A

### readWorkflowInformation

N/A

### readAudits

N/A

### performWorkflowTransition

N/A
