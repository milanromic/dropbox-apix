# Dropbox API wrapper

Dropbox-APIx is [Dropbox](https://www.dropbox.com/) API wrapper with simple upload and share options . It should be used in applications on server side for easy upload on Dropbox and automatic share it. Using this wrapper in MeteorJS framework is also supported.

A simple explanation will be: Call upload method with some parameters and content of a file, it will upload a file and return shared link which could be stored somewhere (in database). For detailed explanation, please read bellow.

## Table of Contents
* [Getting started](#getting-started)
* [Dependencies](#dependencies)
* [How to use?](how-to-use)
* [All wrapper methods](#all-wrapper-methods)

## Getting started
Before start to use this Dropbox API wrapper, please create your Dropbox account and get API key. Please visit https://www.dropbox.com/developers. Also [this](https://www.youtube.com/watch?v=ReXBcosxCzE) or [this](https://www.youtube.com/watch?v=SShn6dkGHq0) video should help to generate API key.

Install npm package with: `npm install 'dropbox-apix' --save` or install in MeteorJS app folder with: `meteor npm install 'dropbox-apix' --save`.

## Dependencies
These dependencies are used in wrapper:
* [XMLHttpRequest](https://www.npmjs.com/package/xmlhttprequest)
* [URL parse](https://www.npmjs.com/package/url-parse)

\* *Note: Dependencies will be automatically installed while installing this wrapper*

## How to use?
Node JS example on server side:
```
var DropboxApix = require('../dropbox-apix');
var fs = require('fs'); // We need this for file reading

var dbx = new DropboxApix({
	key: 'DROPBOX API KEY'
});

var params = {
	path: '/name-of-uploaded-file.jpg',
	autorename: true
}

fs.readFile('local-file-on-server.jpg', function(err, contents) {
	let buffer = new Buffer(contents);
	dbx.upload_with_sharing(params, buffer, function(res, err) {
		if(err) {
			console.log(err.msg);
			return;
		};
		console.log(res); // res is json with filename and link properties
	});
});
```
In callback function, `res` contains:
```
{
	filename: <filename on server>,
	link: <direct link which should be used in HTML -> A HREF property>
}
```

MeteorJS example:
```
// server side
import DropboxApix from 'dropbox-apix';

if(Meteor.isServer) {
	dbx = new DropboxApix({
		key: 'DROPBOX API KEY'
	});
}

Meteor.methods({
	'file-upload': function (filename, fileData) {

		var params = {
			path: '/'+filename,
			autorename: true
		}

		dbx.upload_with_sharing(params, new Buffer(fileData), function(res, err) {
			if(err) {
				console.log(err.msg);
				return;
			};
			// res.link should be stored in database or somewhere else
			console.log(res);
		});
	}
});
```

```
// client side
//HTML
<template name="uploadForm">
    <input id="fileInput" type="file" />
</template>

//JS
Template.uploadForm.events({
  'change #fileInput'(e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
		var file = e.currentTarget.files[0];
		var filename = file.name;
		var reader = new FileReader();
		reader.onload = function(fileLoadEvent) {
			var buffer = new Uint8Array(reader.result) // convert to binary
			Meteor.call('file-upload', filename, buffer);
		};
		reader.readAsArrayBuffer(file);
    }
  }
});
```
After file is uploaded and link received on server side, it should be stored in Database. Client should be subscribed to the collection where are stored links of uploaded files.

## All wrapper methods

### Constructor
```
var dbx = new DropboxApix({
	key: 'DROPBOX API KEY'
});
```
### Debug
Debug is turned off by default. To use debug, add it to the constructor.
```
var dbx = new DropboxApix({
	key: 'DROPBOX API KEY',
	debug: true
});
```
Debug will print all actions in servers console.

### Create folder
This method creates folder on Dropbox.
```
var params = {
    "path": "/custom-folder-name",
	"autorename": false
}

dbx.create_folder(params, function(res, err) {
	if(err) {
		console.log(err.msg);
		return;
	};

	console.log(res);
});
```
Create folder method will return JSON with properties:
```
{
	name: 'custom-folder-name',
	path_lower: '/custom-folder-name',
	path_display: '/custom-folder-name',
	id: 'id:123456xyz'
}
  ```
  There is a possibility to use sub folder while uploading (if folder does not exist, will be created automatically):
  ```
  var params = {
	path: '/custom-folder-name/name-of-uploaded-file.jpg',
	autorename: true
}
```
### Upload
Upload method uploads file on Dropbox without sharing option.
  ```
  var params = {
	path: '/name-of-uploaded-file.jpg',
	autorename: true
}
fs.readFile('test.jpg', function(err, contents) {
	let buffer = new Buffer(contents);
	dbx.upload(params, buffer, function(res, err) {
		if(err) {
			console.log(err.msg);
			return;
		};
		console.log(res);
	});
});
```
`res` contains:
```
{
	name: 'name-of-uploaded-file.jpg',
	path_lower: '/name-of-uploaded-file.jpg',
	path_display: '/name-of-uploaded-file.jpg',
	id: 'id:123456xyz',
	client_modified: '2018-10-06T22:03:54Z',
	server_modified: '2018-10-06T22:03:54Z',
	rev: 'xyz123',
	size: 123456,
	content_hash: '123456abcdef'
}
```
### Upload with sharing
Upload with sharing method uploads file on Dropbox and automatically shares is.
```
var params = {
	path: '/name-of-uploaded-file.jpg',
	autorename: true
}

fs.readFile('local-file-on-server.jpg', function(err, contents) {
	let buffer = new Buffer(contents);
	dbx.upload_with_sharing(params, buffer, function(res, err) {
		if(err) {
			console.log(err.msg);
			return;
		};
		console.log(res); // res is json with filename and link properties
	});
});
```
`res` contains:
```
{
	filename: <filename on server>,
	link: <direct link which should be used in HTML -> A HREF property>
}
```
### Generate shared link
Generate shared link method generate shared link if does not exist. If it exist, just return it.
```
var params = {
    "path": "/already-uploaded-file.jpg"
}

dbx.generate_shared_link('already-uploaded-file.jpg', function(res, err) {
	if(err) {
		console.log(err.msg);
		return;
	};
	console.log(res);
});
```
`res` contains:
```
{
	filename: <filename on server>,
	link: <direct link which should be used in HTML -> A HREF property>
}
```
## Licence
MIT

### Keywords
[dropbox](https://www.npmjs.com/search?q=dropbox)
[dropbox-api](https://www.npmjs.com/search?q=dropbox-api)
[dropbox-wrapper](https://www.npmjs.com/search?q=dropbox-wrapper)
[meteor](https://www.npmjs.com/search?q=meteor)
[meteor-api](https://www.npmjs.com/search?q=meteor-api)
[webstorage](https://www.npmjs.com/search?q=webstorage)
[storage](https://www.npmjs.com/search?q=storage)
