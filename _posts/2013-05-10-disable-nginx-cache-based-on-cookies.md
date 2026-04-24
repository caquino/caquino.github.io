---
layout: post
title: Disable NGINX cache based on cookies
cover: /images/disable-nginx-cache-based-on-cookies/cover.svg
description: "Using proxy_cache_bypass and map disables NGINX cache based on cookies."
date: '2013-05-10T01:59:11+01:00'
tags:
- nginx
- sysadmin
- cache
- tips
tumblr_url: http://syshero.org/post/50053543196/disable-nginx-cache-based-on-cookies
---
Caching of dynamic content is difficult and invalidation of cache even more difficult. Maybe you already heard Phil Karlton's wise saying:

> There are only two hard things in Computer Science: Cache invalidation and naming things.

<!--more-->

If you have one situation when you need to disable caching, after the client logs in on the application, and this application uses cookies to track logged-in users, you can use the [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) directive.

For example [.NET applications](http://msdn.microsoft.com/en-us/library/ee920427.aspx), when using the default configuration, will use the cookie named .ASPXAUTH to track if a user is authenticated.

Using [proxy_cache_bypass](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_bypass), [proxy_no_cache](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_no_cache) and [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) will let us disable caching for logged-in users while still keep the cache for anonymous users.

I have added a simple configuration snippet to show how it works, first we need to add a [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) definition with the desired cookie:

```text
map $http_cookie $no_cache {
  default 0;
  ~ASPXAUTH 1;
}
```

And using the return value from the [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) previously defined, disable caching for it using [proxy_no_cache](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_no_cache)

```text
location / {
  ...
  proxy_no_cache $no_cache;
  ...
}
```

See you next time!

---

**EDIT 2026-04-24.** Removed two links to a companion post on caching zero-byte responses; I retired that post after a 2026 technical review (the `$upstream_http_content_length` approach it described didn’t catch chunked-empty responses, so the advice was misleading for most real-world cases).
