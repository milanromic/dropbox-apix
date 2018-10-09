/*
 * dropbox-apix
 * Copyright(c) 2018 Milan Romic (milan.romic.ftn@gmail.com)
 * MIT Licensed
 */

'use strict';

var linkv2 = 'https://api.dropboxapi.com/2/';
var linkv2content = 'https://content.dropboxapi.com/2/';

class DropboxApix {
	constructor(params) {
		if(!params.key) {
			console.log('Error, please provide API key');
			return;
		}
		this.key = params.key;
		this.debug = params.debug;
		this.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		this.parser = require('url-parse');
	}

	cDebug(...args) {
		if(this.debug) {
			console.log(args.join(', '));
		}
	}

	/*************************************************************************/
	/******************************** FILES **********************************/
	/*************************************************************************/

	create_folder(params, cb) {
		var request = new this.XMLHttpRequest();
		if(!request) {
			if(cb) {
				cb(null, {msg: 'Error with XMLHttpRequest'});
			}
			return;
		}

		request.open('POST', linkv2 + 'files/create_folder');
		request.setRequestHeader('Authorization', 'Bearer ' + this.key);
		request.setRequestHeader('Content-Type', 'application/json');

		// Communication error
		request.onerror = function() {
			if(cb) {
				cb(null, {msg: request.responseText});
			}
			return;
		}

		// Communication success
		request.onload = function() {
			let response = JSON.parse(request.responseText);
			// Error from API
			if(response && response.error_summary) {
				if(cb) {
					cb(null, {msg: response.error_summary});
				}
				return;
			}

			// Success from API
			if(cb) {
				cb(response);
			}
		}

		// Send request
		request.send(JSON.stringify(params));
	}

	upload(params, data, cb) {
		var request = new this.XMLHttpRequest();
		if(!request) {
			if(cb) {
				cb(null, {msg: 'Error with XMLHttpRequest'});
			}
			return;
		}

		request.open('POST', linkv2content + 'files/upload');
		request.setRequestHeader('Authorization', 'Bearer ' + this.key);
		request.setRequestHeader('Content-Type', 'application/octet-stream');
		request.setRequestHeader('Dropbox-API-Arg', JSON.stringify(params));

		// Communication error
		request.onerror = function() {
			if(cb) {
				cb(null, {msg: request.responseText});
			}
			return;
		}

		// Communication success
		request.onload = function() {
			let response = JSON.parse(request.responseText);
			// Error from API
			if(response && response.error_summary) {
				if(cb) {
					cb(null, {msg: response.error_summary});
				}
				return;
			}

			// Success from API
			if(cb) {
				cb(response);
			}
		}

		// Send request
		request.send(data);

	}

	upload_with_sharing(params, data, cb) {
		var self = this;
		var request = new this.XMLHttpRequest();
		if(!request) {
			if(cb) {
				cb(null, {msg: 'Error with XMLHttpRequest'});
			}
			return;
		}

		this.upload(params, data, function(res, err) {
			if(err) {
				if(cb) {
					cb(null, err);
					return;
				}
				self.cDebug('Something goes wrong (upload): ', err.msg);
				return;
			}
			self.generate_shared_link(res.name, function(_res, _err) {
				if(_err) {
					if(cb) {
						cb(null, err);
						return;
					}
					self.cDebug('Something goes wrong (generate_shared_link): ', _err.msg);
					return;
				}
				// Direct link manipulation
				if(params.hasOwnProperty('dl') && !params.dl) {
					// Everything passed success
					if(cb) {
						cb({
							filename: _res.filename,
							link: _res.link
						});
					}
				} else {
					var parsed = self.parser(_res.link);
					parsed.set('query', {dl: 1});
					// Everything passed success
					if(cb) {
						cb({
							filename: _res.filename,
							link: parsed.href
						});
					}
				}
			})
		})
	}

	/*************************************************************************/
	/******************************* SHARING *********************************/
	/*************************************************************************/

	// If shared link exist, return.
	// If shared link doesn't exist, generate it and return
	generate_shared_link(filename, cb) {
		var self = this;
		var request = new this.XMLHttpRequest();

		this.list_shared_links({path: '/' + filename}, function(res, err) {
			if(err) {
				if(cb) {
					cb(null, err);
					return;
				}
				self.cDebug('Something goes wrong (generate_shared_link): ', err.msg);
				return;
			}

			if(res && res.links.length == 0) {
				var settings = {
				    path: '/' + filename,
				    settings: {
				        requested_visibility: 'public'
				    }
				}

				self.create_shared_link_with_settings(settings, function(res, err) {
					if(err) {
						if(cb) {
							cb(null, err);
							return;
						}
						self.cDebug('Something goes wrong (create_shared_link_with_settings): ', err.msg);
						return;
					}

					// Direct link manipulation
					var parsed = self.parser(res.url);
					parsed.set('query', {dl: 1});
					// Everything passed success
					if(cb) {
						cb({
							filename: filename,
							link: parsed.href
						});
					}
				});

			} else {
				// Direct link manipulation
				var parsed = self.parser(res.links[0].url);
				parsed.set('query', {dl: 1});
				// Everything passed success
				if(cb) {
					cb({
						filename: filename,
						link: parsed.href
					});
				}
			}
		})

	}

	create_shared_link_with_settings(params, cb) {
		var request = new this.XMLHttpRequest();
		if(!request) {
			if(cb) {
				cb(null, {msg: 'Error with XMLHttpRequest'});
			}
			return;
		}

		request.open('POST', linkv2 + 'sharing/create_shared_link_with_settings');
		request.setRequestHeader('Authorization', 'Bearer ' + this.key);
		request.setRequestHeader('Content-Type', 'application/json');

		// Communication error
		request.onerror = function() {
			if(cb) {
				cb(null, {msg: request.responseText});
			}
			return;
		}

		// Communication success
		request.onload = function() {
			let response = JSON.parse(request.responseText);
			// Error from API
			if(response && response.error_summary) {
				if(cb) {
					cb(null, {msg: response.error_summary});
				}
				return;
			}

			// Success from API
			if(cb) {
				cb(response);
			}

		}

		// Send request
		request.send(JSON.stringify(params));
	}

	list_shared_links(params, cb) {
		var request = new this.XMLHttpRequest();
		if(!request) {
			if(cb) {
				cb(null, {msg: 'Error with XMLHttpRequest'});
			}
			return;
		}

		request.open('POST', linkv2 + 'sharing/list_shared_links');
		request.setRequestHeader('Authorization', 'Bearer ' + this.key);
		request.setRequestHeader('Content-Type', 'application/json');

		// Communication error
		request.onerror = function() {
			if(cb) {
				cb(null, {msg: request.responseText});
			}
			return;
		}

		// Communication success
		request.onload = function() {
			let response = JSON.parse(request.responseText);
			// Error from API
			if(response && response.error_summary) {
				if(cb) {
					cb(null, {msg: response.error_summary});
				}
				return;
			}

			// Success from API
			if(cb) {
				cb(response);
			}

		}

		// Send request
		request.send(JSON.stringify(params));
	}


}

module.exports = DropboxApix;
