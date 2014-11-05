# Online GLSA Checker Proxies

Various proxies for ogc. Built for [docker](https://docker.io).

## install

```
docker pull hairmare/ogc-proxy
```

## Usage

Call it using ``docker run hairmare/ogc-proxy``.

```
  proxy <Command> - run an ogc proxy

    Please refer to each commands --help for details now how to run each service.

  Commands:

    main [options]   run the main reverse proxy instance
    ssl [options]    run HTTPS -> HTTP proxy

  Options:

    -h, --help     output usage information
    -V, --version  output the version number


  proxy main [--api-host <host>] [--gui-host <host>] [--dist-host <host>]

    run the main reverse proxy for ogc

  Options:

    -h, --help                             output usage information
    --listen-port <PROXY_HOST>             port to listen on, default: 80
    
    --api-host    <API_PORT_80_TCP_ADDR>   host where the api server lives on, default: localhost
    --api-port    <API_PORT_80_TCP_PORT>   port of the api server, default: 80
    
    --gui-host    <GUI_PORT_80_TCP_ADDR>   host where the gui is hosted, default: localhost
    --gui-port    <GUI_PORT_80_TCP_PORT>   port of the gui server, default: 80
    
    --dist-host   <DIST_PORT_80_TCP_ADDR>  host where the builds are, default: localhost
    --dist-port   <DIST_PORT_80_TCP_PORT>  port of the dist server, default: 80


  proxy ssl [--target-host <host>]

    add ssl services to a front facing web service

    You will want to override at least some, if not most params.

  Options:

    -h, --help                             output usage information
    --listen-port <PROXY_PORT>             port to listen on,  default: 443
    
    --target-host <MAIN_PORT_80_TCP_ADDR>  host to secure, default: localhost
    --target-port <MAIN_PORT_80_TCP_PORT>  port to secure, default: localhost
    
    --key         <PROXY_KEY>              ssl key file, default: key.pem
    --cert        <PROXY_CERT>             ssl cert file, default: cert.pem

```

## Run on Docker

```
# main (front-)proxy
docker run --name ogc-proxy-main --link ogc-api:api         hairmare/ogc-proxy main
# ssl proxy
docker run --name ogc-proxy-ssl  --link ogc-proxy-main:main hairmare/ogc-proxy ssl
```
