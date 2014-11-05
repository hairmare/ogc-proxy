#!/usr/bin/env node
"use strict";

var program = require('commander');
var express = require('express');
var proxy   = require('http-proxy');
var fs      = require('fs');

var running = false;

program.version(require('./package.json').version)
       .usage("<Command> - run an ogc proxy\n\n    Please refer to each commands --help for details now how to run each service.");

program.command('main')
       .description('run the main reverse proxy instance')
       .usage("[--api-host <host>] [--gui-host <host>] [--dist-host <host>]\n\n    run the main reverse proxy for ogc")
       .option('--listen-port <PROXY_HOST>',            "port to listen on, default: 80\n", process.env.PROXY_PORT || 80)
       .option('--api-host    <API_PORT_80_TCP_ADDR>',  'host where the api server lives on, default: localhost',  process.env.API_PORT_80_TCP_ADDR || 'localhost')
       .option('--api-port    <API_PORT_80_TCP_PORT>',  "port of the api server, default: 80\n",  process.env.API_PORT_80_TCP_PORT || 80)
       .option('--gui-host    <GUI_PORT_80_TCP_ADDR>',  'host where the gui is hosted, default: localhost',  process.env.GUI_PORT_80_TCP_ADDR || 'localhost')
       .option('--gui-port    <GUI_PORT_80_TCP_PORT>',  "port of the gui server, default: 80\n",  process.env.GUI_PORT_80_TCP_PORT || 80)
       .option('--dist-host   <DIST_PORT_80_TCP_ADDR>', 'host where the builds are, default: localhost', process.env.DIST_PORT_80_TCP_ADDR || 'localhost')
       .option('--dist-port   <DIST_PORT_80_TCP_PORT>', 'port of the dist server, default: 80', process.env.DIST_PORT_80_TCP_PORT || 80)
       .action(function (options) {
         var app = express();
         var apiProxy = proxy.createProxyServer();
         var guiProxy = proxy.createProxyServer();
         var distProxy = proxy.createProxyServer();
         app.all("/api/*", function(req, res) {
           apiProxy.web(req, res, { target: 'http://' + options.apiHost + ':' + options.apiPort });
         });
         app.all("/gui/*", function(req, res) {
           guiProxy.web(req, res, { target: 'http://' + options.guiHost + ':' + options.guiPort });
         });
         app.all("/dist/*", function(req, res) {
           distProxy.web(req, res, { target: 'http://' + options.distHost + ':' + options.distPort });
         });
         var server = app.listen(options.listenPort, function() {
           console.log('proxy running on http://%s:%s', server.address().address, server.address().port);
         });
         running = true;
       });

program.command('ssl')
       .description('run HTTPS -> HTTP proxy')
       .usage("[--target-host <host>]\n\n    add ssl services to a front facing web service\n\n    You will want to override at least some, if not most params.")
       .option('--listen-port <PROXY_PORT>',            "port to listen on,  default: 443\n", process.env.PROXY_PORT || 443)
       .option('--target-host <MAIN_PORT_80_TCP_ADDR>', 'host to secure, default: localhost', process.env.MAIN_PORT_80_TCP_ADDR || 'localhost')
       .option('--target-port <MAIN_PORT_80_TCP_PORT>', "port to secure, default: localhost\n", process.env.MAIN_PORT_80_TCP_PORT || 80)
       .option('--key         <PROXY_KEY>',             'ssl key file, default: key.pem', process.env.PROXY_KEY || 'key.pem')
       .option('--cert        <PROXY_CERT>',            'ssl cert file, default: cert.pem', process.env.PROXY_CERT || 'cert.pem')
       .action(function (options) {
         proxy.createServer({
           target: {
             host: options.targetHost,
             port: options.targetPort
           },
           ssl: {
             key: fs.readFileSync(options.key, 'utf8'),
             cert: fs.readFileSync(options.cert, 'utf8')
           }
         }).listen(options.listenPort);
       });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
if (!running) {
  program.help();
}
