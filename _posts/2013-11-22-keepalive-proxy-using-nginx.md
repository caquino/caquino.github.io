---
layout: post
title: Keepalive proxy using NGINX
cover: /images/keepalive-proxy-using-nginx/cover.svg
description: "Configuring NGINX as a keepalive proxy to remote web services using upstream and keepalive directives."
date: '2013-11-22T03:01:45+00:00'
tags:
- nginx
- open source
- sysadmin
- proxy
tumblr_url: http://syshero.org/post/67718581028/keepalive-proxy-using-nginx
---
Lets cleanup the dust here!

PHP applications can’t handle persistent connections, at least not without a lot of effort and esoteric solutions.

If you need to call external HTTP servers, for example, web services, this can cause a huge performance impact as your application will reestablish the connection on every request and if it uses SSL will be even worse.
<!--more-->
HTTP/1.0 states that a client can request persistent connections, and HTTP/1.1 states that all connections are persistent unless the client states otherwise, normally you can use this functionality to reuse connections, but as PHP applications are not persistent, it exits on every request, the connections will also be closed.

A way to have “partial” persistent connections is proxying the connections to the remote web service using your local nginx, and as a bonus, you can even offload your SSL to nginx, I call it partial because locally the connection is still not persistent.
To achieve this, you can create an upstream that points to the remote web service with persistent connections, using the keepalive directive.

You will connect locally to your nginx server, and your nginx will have to keep persistent connections to your upstreams.

```bash
local application —> connection without persistence — > nginx —> remote connection having persistence —> remote server
```

You can see an example in the following gist:

```nginx
upstream webservice-pers {
  server webservices.remoteserver.com:80 max_fails=0 fail_timeout=30s;
  keepalive 1024;
}

server {
  listen   8080;
  server_name  webservices.localserver.com;
  
  location / {
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host "webservices.remoteserver.com";
    proxy_pass https://webservice-pers;
  }
}
```

Thanks, everyone!
