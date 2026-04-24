---
layout: post
title: NGINX passive cache invalidation
cover: /images/nginx-passive-cache-invalidation/cover.svg
description: "Implementing passive cache invalidation in NGINX using Lua and a shared dictionary queue."
date: '2013-11-29T18:51:33+00:00'
tags:
- nginx
- lua
- devops
- sysadmins
- caching
- http
tumblr_url: http://syshero.org/post/68479556365/nginx-passive-cache-invalidation
---
Let's talk again about nginx caching, another post that I wrote about cache purging can be a good start for you.

First of all, this is a proof-of-concept and was not used in production (yet), so if you are brave enough to use it, let me know the results.
<!--more-->
I was reading a very good post about varnish and trying to figure out a way to do cache invalidation in the same way they are doing but using nginx.

After some failures I was able to create something that I called “passive cache invalidation”, because all the procedure is made together on the normal requests, the first idea was to use ngx.location.capture to do a request to a specific purge URL, but working with a queue appears to be more effective and performatic.

The idea behind is relatively simple, the application on the backend can add a header to the response asking nginx to invalidate a cached URL.

An example of a request with this concept is the following:

![Cache Diagram]({{ "/assets/cache-diagram.png" | absolute_url }})

To test this concept your nginx will need Lua support enabled, and if you are using Debian/Ubuntu the package nginx-extras already has support enabled.

As you will see on the following configuration, the queue is stored in a shared dictionary, so take care of the size used by it, I’ve had the basic precaution of removing already invalidated URLs from the queue.

If anyone needs any more information or if you are a brave man that is using this in production, drop a comment and let me know.

**backend.conf**

```nginx
server {
  listen 80;

  server_name backend;

  root /usr/share/nginx/www;
  index index.html index.html;

  location / {
    header_filter_by_lua '
      ngx.header["X-Expire-Content"] = "/random"
    ';
    content_by_lua '
      ngx.say("Adding /random URL to the invalidation queue.")
    ';
  }

  location = /random {
    content_by_lua '
      ngx.say(math.random(100))
    ';
  }
}
```

**frontend.conf**

```nginx
lua_shared_dict expire_queue 10m;

proxy_cache_path  /dev/shm/nginx/ levels=1:2   keys_zone=default:10m;

server {
  listen   80;

  root /usr/share/nginx/www;
  index index.html index.htm;

  server_name frontend;

  location / {
    header_filter_by_lua '
      if ngx.header["X-Expire-Content"] then
        ngx.log(ngx.INFO, "Backend sent invalidation header, adding to the queue " .. ngx.header["X-Expire-Content"])
        ngx.shared.expire_queue:add(ngx.header["X-Expire-Content"],1)
      end
    ';
    
    set_by_lua $http_cache_purge '
      local expire = ngx.shared.expire_queue:get(ngx.var.uri)
        if expire then
          ngx.log(ngx.INFO, "Removing URL from queue and invalidating, " .. ngx.var.uri)
          ngx.shared.expire_queue:delete(ngx.var.uri)
        end
        return expire
      ';

    add_header X-Cached $upstream_cache_status;
    proxy_cache_bypass $http_cache_purge;
    proxy_cache default;
    proxy_cache_valid 200 302 72h;
    proxy_pass http://backend/;
  }
}
```

**test-output**

```text
root@precise32:~# wget -S -q -O - frontend/random # Missed request
  HTTP/1.1 200 OK
  Server: nginx/1.1.19
  Date: Fri, 29 Nov 2013 05:24:21 GMT
  Content-Type: application/octet-stream
  Content-Length: 3
  Connection: keep-alive
  X-Cached: MISS
54
root@precise32:~# wget -S -q -O - frontend/random # Cached request
  HTTP/1.1 200 OK
  Server: nginx/1.1.19
  Date: Fri, 29 Nov 2013 05:24:23 GMT
  Content-Type: application/octet-stream
  Content-Length: 3
  Connection: keep-alive
  X-Cached: HIT
54
root@precise32:~# wget -S -q -O - frontend/ # Invalidation queue access
  HTTP/1.1 200 OK
  Server: nginx/1.1.19
  Date: Fri, 29 Nov 2013 05:24:27 GMT
  Content-Type: application/octet-stream
  Content-Length: 44
  Connection: keep-alive
  X-Expire-Content: /random
  X-Cached: MISS
Adding /random URL to the invalidation queue.
root@precise32:~# wget -S -q -O - frontend/random # Cache invalidation request using bypass
  HTTP/1.1 200 OK
  Server: nginx/1.1.19
  Date: Fri, 29 Nov 2013 05:24:31 GMT
  Content-Type: application/octet-stream
  Content-Length: 2
  Connection: keep-alive
  X-Cached: BYPASS
1
root@precise32:~# wget -S -q -O - frontend/random # Cached request
  HTTP/1.1 200 OK
  Server: nginx/1.1.19
  Date: Fri, 29 Nov 2013 05:24:32 GMT
  Content-Type: application/octet-stream
  Content-Length: 2
  Connection: keep-alive
  X-Cached: HIT
1
```

The backend.conf configuration is just needed if you want to setup a lab to simulate a frontend and a backend, just add the hostnames backend and frontend to your /etc/hosts and it’s working.

The invalidation is handled on the frontend.conf, the header_filter_by_lua adds new invalidation requests received from the backend to the queue and set_by_lua set the variable forcing a bypass on the cache and remove the URL from the queue.

As you see on the tests, the next request after the backend has asked for invalidation, makes the client receive a BYPASS as expected.

Again guys: if you know any company needing a Senior DevOps, willing to sponsor my relocation, drop me a message!
Thanks,
