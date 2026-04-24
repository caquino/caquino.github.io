---
layout: post
title: Thinking outside of the box with NGINX series - geo command
series: "Thinking outside the box with NGINX"
cover: /images/thinking-outside-of-the-box-with-nginx-series-geo/cover.svg
description: "Using NGINX's geo command to match network blocks and route traffic to different upstreams or apply rate limits."
date: '2016-06-16T22:14:44+01:00'
tags:
- nginx
- devops
- smart
- solution
tumblr_url: http://syshero.org/post/146028334747/thinking-outside-of-the-box-with-nginx-series
---
For the second part of this series let’s talk about another command, this time, let’s talk about the [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) command.

The [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) command, as the name says, was created to allow geolocation information, but actually, you can think of [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) as a “switch case” where you can match network blocks and get a result from it.
<!--more-->
So let’s say for example that you want your QA team to always go to your preproduction environment instead of production, with [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) this can be done easily, provide your team have a fixed IP address that you match.

```nginx
upstream production {
  server 192.168.0.1:80;
  server 192.168.0.2:80;
}

upstream preproduction {
  server 192.168.1.1:80;
  server 192.168.1.2:80;
}

geo $upstream_group {
  default "production";
  192.168.10.0/24 "preproduction";
}

server {
  listen 80;
  location / {
    proxy_pass http://$upstream_group;
  }
}
```

Another possibility is to route a single server or a group of servers to a different upstream, for example, to do regression tests in a debug server, this is possible if you use NGINX to route the API calls through your application stack.

The [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) can also be used together with the rate limit module, allowing you to specify rules for specific netblocks, let’s say you have a global rate limit and you want to allow your special customer to be whitelisted.

```nginx
upstream production {
  server 192.168.0.1:80;
  server 192.168.0.2:80;
}

limit_req_zone $limit_var zone=limit_default:10m rate=10r/s;

geo $limit_var {
  default $binary_remote_addr;
  200.200.200.0/24 "";
}

server {
  listen 80;
  location / {
    limit_req zone=limit_default burst=10;
    proxy_pass http://production;
  }
}
```

The idea here is to use the variable $binary_remote_addr for every request except for the customer network, for the customer network we will return an empty value.

On the next post, we will talk about the map command.

If you have any suggestion for a post or if you even have NGINX questions feel free to contact me through the contact link here on the blog.

As the idea of this series of posts is to show different ways of using NGINX configurations, I would like to ask for your collaboration sending questions or even guest posts.

See you in the next post, thanks!
