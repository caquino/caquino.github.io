---
layout: post
title: Disable NGINX cache based on cookies
date: '2013-05-10T01:59:11+01:00'
tags:
- nginx
- sysadmin
- cache
- tips
tumblr_url: http://syshero.org/post/50053543196/disable-nginx-cache-based-on-cookies
---
Caching of dynamic content is difficult and invalidation of cache even more difficult, maybe you already heard Phil Karlton’s wise saying

> There are only two hard things in Computer Science: Cache invalidation and naming things.
<!--more-->
If you have one situation when you need to disable caching, after the client logs in on the application, and this application uses cookies to track logged-in users, you can use the same [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) function that was used to [avoid 0-byte file caching]({% post_url 2013-05-04-avoid-caching-0-byte-files-on-nginx %}).

For example [.NET applications](http://msdn.microsoft.com/en-us/library/ee920427.aspx), when using the default configuration, will use the cookie named .ASPXAUTH to track if a user is authenticated.

If you read my blog post about [0-byte file caching]({% post_url 2013-05-04-avoid-caching-0-byte-files-on-nginx %}), you already heard about [proxy_cache_bypass](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_bypass).

Using [proxy_cache_bypass](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_bypass), [proxy_no_cache](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_no_cache) and [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) will let us disable caching for logged-in users while still keep the cache for anonymous users.

I have added a simple configuration snippet to show how it works, first we need to add a [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) definition with the desired cookie:

{% gist 5551277 map-nginx-cookie %}

And using the return value from the [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) previously defined, disable caching for it using [proxy_no_cache](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_no_cache)

{% gist 5551277 nginx-configuration-snippet %}

See you next time!
