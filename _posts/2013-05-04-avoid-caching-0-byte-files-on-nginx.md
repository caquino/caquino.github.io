---
layout: post
title: Avoid caching 0-byte files on NGINX
date: '2013-05-04T15:31:00+01:00'
tags:
- nginx
- tips
- sysadmin
- cache
tumblr_url: http://syshero.org/post/49594172838/avoid-caching-0-byte-files-on-nginx
---
Some people, including myself, had problems with some applications misbehaving and sending empty outputs (hello PHP, I'm talking to you!).

The problem is even worse if you have a cache in front of your frontends and this empty page gets cached, your cache will send empty output until it expires or be purged.
<!--more-->
To avoid this, you can use one small configuration snippet that uses the Content-Length response from the upstream to disable caching.

Basically, the idea is "only cache if the size is greater than 0", and to achieve this, you can use the following configuration on NGINX.

{% gist 5506639 %}

The [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) will set 1 to the variable flag_cache_empty if the Content-Length from the upstream is 0 and after this variable is used to disable cache and enable bypass.
