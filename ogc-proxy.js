#!/usr/bin/env node
"use strict";

var program = require('commander');
var bunyan  = require('bunyan');
var express = require('express');
var elogger = require('express-bunyan-logger');
var proxy   = require('http-proxy');
var fs      = require('fs');

var running = false;
var logger  = bunyan.createLogger({name: 'ogc-proxy'});

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

         app.use(elogger({name: 'ogc-proxy-main'}));

         var apiProxy = proxy.createProxyServer({ target: 'http://' + options.apiHost + ':' + options.apiPort });
         var guiProxy = proxy.createProxyServer({ target: 'http://' + options.guiHost + ':' + options.guiPort });
         var distProxy = proxy.createProxyServer({ target: 'http://' + options.distHost + ':' + options.distPort });

         app.all("/",            function(req, res) { guiProxy.web(req, res); });
         app.all("/index.html",  function(req, res) { guiProxy.web(req, res); });
         app.all("/favicon.ico", function(req, res) { guiProxy.web(req, res); });
         app.all("/fonts/*",     function(req, res) { guiProxy.web(req, res); });

         app.all("/dist/*",      function(req, res) { distProxy.web(req, res); });

         app.all("/*",           function(req, res) { apiProxy.web(req, res); });

         var server = app.listen(options.listenPort, function() {
           logger.info({address: server.address().address, port: server.address().port}, 'main ogc-proxy initialized');
           logger.info({address: options.distHost, port: options.distPort}, 'dist host targeted');
           logger.info({address: options.apiHost, port: options.apiPort}, 'api host targeted');
           logger.info({address: options.guiHost, port: options.guiPort}, 'gui host targeted');
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
         var app = express();
         app.use(elogger({name: 'ogc-proxy-ssl'}));
         var proxy = proxy.createServer({
           ssl: {
             key: fs.readFileSync(options.key, 'utf8'),
             cert: fs.readFileSync(options.cert, 'utf8')
           }
         })
         app.all('/*', function(req, res) {
           proxy.web(req, res, { target: 'http://' + options.targetHost + ':' + options.targetPort })
         });
         var server = app.listen(options.listenPort, function() {
           logger.info({address: server.address().address, port: server.address().port}, 'ssl ogc-proxy initialized');
         });
       });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
if (!running) {
  program.help();
}
