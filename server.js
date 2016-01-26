'use strict';

const Hapi = require('hapi');

// Create a server with a host and port
var server = new Hapi.Server(~~process.env.PORT || 3000, '0.0.0.0');

// Add the route
server.register(require('inert'), (err) => {
    if (err) {
        throw err;
    }

	// Look for files in public dir
	server.route({
		method: 'GET',
		path: '/{param*}',
		handler: {
			directory: {
				path: 'public',
				listing: true
			}
		}
	});
	
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.file('./public/index.html');
        }
    });
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});