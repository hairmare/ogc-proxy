# Online GLSA Checker Proxies

[![Docker badge](http://img.shields.io/badge/Docker-hairmare%2Fogc--proxy-008bb8.svg)](https://registry.hub.docker.com/u/hairmare/ogc-proxy/) [![HuBoard badge](http://img.shields.io/badge/Hu-Board-7965cc.svg)](https://huboard.com/hairmare/ogc)

Various proxies for ogc. Built for [docker](https://docker.io).

## Install

```
docker pull hairmare/ogc-proxy
```

## Usage

Call it using ``docker run hairmare/ogc-proxy``.

```
  Usage: ogc-proxy <Command> - run an ogc proxy

    Please refer to each commands --help for details now how to run each service.

  Commands:

    main [options]   run the main reverse proxy instance
    ssl [options]    run HTTPS -> HTTP proxy

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```
