---
layout: post
title: SSL acceleration using NGINX and backend SSL connection identification
cover: /images/ssl-acceleration-using-nginx-and-backend-ssl/cover.svg
description: "Setting X-Forwarded-Proto headers with NGINX proxy_set_header identifies SSL connections to backend servers."
date: '2016-06-09T17:58:47+01:00'
tags: []
tumblr_url: http://syshero.org/post/145664994617/ssl-acceleration-using-nginx-and-backend-ssl
---
One common trick to optimize SSL termination performance is to have a proxy terminating all the SSL connections and proxying the connection to a plain HTTP backend.

This, in theory, works very well and without any code changes, but in practice, you discover that after doing this your application can’t tell the difference between HTTP and HTTPS clients.
<!--more-->
The most common issue is that the application creates a redirect loop trying to redirect the user to HTTPS because the application is not able to know that the user is already using HTTPS. 

But how to solve this issue? The most common method is to use an HTTP Header to identify SSL/non-SSL connections, this way the application can know which protocol was used on the request.

The header used for this purpose is X-Forwarded-Proto, which can be added to the upstream request using proxy_set_header, as we want this header to be sent to the backend servers and not to the clients.

With this header in place, the application can take actions by evaluating the value set on it.

The following example sets the X-Forwarded-Proto header and forwards the connection to our backend using proxy_pass.

**EDIT 2026-04-24.** Removed the `ssl on;` line from the snippet below. That directive was deprecated in nginx 1.15.0 (April 2018) and just triggers a warning now; the right form is `listen 443 ssl;` on its own, which this config already has.

```nginx
server {
  listen 443 ssl;
  server_name example.com www.example.com;
  
  ssl_certificate         /etc/nginx/ssl/example.com/server.crt;
  ssl_certificate_key     /etc/nginx/ssl/example.com/server.key;
  ssl_trusted_certificate /etc/nginx/ssl/example.com/ca-certs.pem;
  
  location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://backend;
  }
}
```
