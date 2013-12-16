'use strict';
var express = require('express'),
  http = require('http'),
  https = require('https'),
  fs = require('fs'),
  app = express(),
  opts = require(__dirname + '/config/opts.js');


// Load express configuration
require(__dirname + '/config/env.js')(express, app);
// Load routes
require(__dirname + '/routes')(app);

var env = app.get('env');

var port = opts.port;
var https_port = opts.port + 1;
var server;


if (env === 'production') {
  port = 80;
  https_port = 443;

  var httpsOpts = {
    key: fs.readFileSync(__dirname + '/cert/pem/agent2-key.pem'),
    cert: fs.readFileSync(__dirname + '/cert/pem/agent2-cert.pem')
  };

  // Start the server
  server = https.createServer(httpsOpts, app).listen(https_port, function() {
    console.log('Express server listening on port %d in %s mode',
      https_port, app.settings.env);
  });

  var http = express();

  // set up a route to redirect http to https
  http.get('*', function(req, res) {
    res.redirect('https://' + req.headers.host.replace(/\:.*/, '') + ':' + https_port + req.url);
  })

  http.listen(port, function() {
    console.log('Redirecting http requests on port %d in %s mode to https port %d',
      port, app.settings.env, https_port);
  });

} else {
  // Start the server
  server = http.createServer(app).listen(port, function() {
    console.log('Express server listening on port %d in %s mode',
      port, app.settings.env);
  });
}

module.exports = server;
