---
layout: post
title: Persistent backend selection using cookies with NGINX
cover: /images/persistent-backend-selection-using-cookies-with/cover.svg
description: "NGINX maps URL paths to backends using cookies and regular expressions."
date: '2015-07-03T16:58:37+01:00'
tags:
- devops nginx linux sysadmin proxying
tumblr_url: http://syshero.org/post/123124082042/persistent-backend-selection-using-cookies-with
---
Today a good old friend, [Alex](https://github.com/fiorix), sent me a "Bat signal" asking for help with an unusual NGINX configuration, I wonder why my friends only remembers me during "weird" incidents :P

Basically the requirement was to run a multiple copies of a legacy application on the same URL as it does not support folder prefix or subdomains.
<!--more-->
The desired functionality was that /app1 configures nginx to use backend1 and return to /, and all the subsequent requests on / should be sent to backend1, the same with /app2 to backend2 and /app3 to backend3.

So the solution we designed is:

A request to http://server/app1, sets a cookie to be used for backend selection, and redirect to /.
subsequent requests to /, will use the cookie value and select the backend based on it.

So on this example it was used a combination of map, regexp named matches and cookies using NGINX.

The configuration below achieves this functionality, mapping /app[0-9] to specific backend listed on the map { }

```nginx
map $cookie_beid $backend {
  default www.globo.com:80;
  1       www.uol.com.br:80;
  2       www.ig.com.br:80;
  3       www.terra.com.br:80;
}

server {
  listen 80 default;
  server_name _;

  resolver 4.2.2.2;

  location ~ ^/app(?<beid>[0-9]+) {
    add_header Set-Cookie   "beid=${beid};Max-Age=31536000";
    return 301 /;
  }

  location / {
    add_header X-Backend $backend;
    add_header X-BeID $cookie_beid;
    proxy_pass http://$backend;
  }

}
```

Thanks!
