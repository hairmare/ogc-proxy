FROM hairmare/node
Maintainer Lucas Bickel <hairmare@purplehaze.ch>

# stage app

COPY package.json /usr/local/src/ogc-proxy/package.json
COPY README.md    /usr/local/src/ogc-proxy/README.md
COPY ogc-proxy.js /usr/local/src/ogc-proxy/ogc-proxy.js

# install app

RUN cd /usr/local/src/ogc-proxy; npm install -g && chmod +x /usr/lib/node_modules/ogc-proxy/ogc-proxy.js

# configure runtime

ENTRYPOINT [ "node", "/usr/lib/node_modules/ogc-proxy/ogc-proxy.js" ]
CMD ['--help']

EXPOSE 80 443
