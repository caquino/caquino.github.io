---
layout: post
title: NGINX passive cache invalidation
date: '2013-11-29T18:51:33+00:00'
tags:
- nginx
- lua
- DevOps
- Sysadmins
- caching
- http
tumblr_url: http://syshero.org/post/68479556365/nginx-passive-cache-invalidation
---
Let's talk again about nginx caching, another post that I wrote about cache purging can be a good start for you.

First of all, this is a proof-of-concept and was not used in production (yet), so if you are brave enough to use it, let me know the results.

I was reading a very good post about varnish and trying to figure out a way to do cache invalidation in the same way they are doing but using nginx.

After some failures I was able to create something that I called “passive cache invalidation”, because all the procedure is made together on the normal requests, the first idea was to use ngx.location.capture to do a request to a specific purge URL, but working with a queue appears to be more effective and performatic.

The idea behind is relatively simple, the application on the backend can add a header to the response asking nginx to invalidate a cached URL.

An example of a request with this concept is the following:

![Cache Diagram]({{ "/assets/cache-diagram.png" | absolute_url }})

To test this concept your nginx will need Lua support enabled, and if you are using Debian/Ubuntu the package nginx-extras already has support enabled.

As you will see on the following configuration, the queue is stored in a shared dictionary, so take care of the size used by it, I’ve had the basic precaution of removing already invalidated URLs from the queue.

If anyone needs any more information or if you are a brave man that is using this in production, drop a comment and let me know.

{% gist 7701926 %}

The backend.conf configuration is just needed if you want to setup a lab to simulate a frontend and a backend, just add the hostnames backend and frontend to your /etc/hosts and it’s working.

The invalidation is handled on the frontend.conf, the header_filter_by_lua adds new invalidation requests received from the backend to the queue and set_by_lua set the variable forcing a bypass on the cache and remove the URL from the queue.

As you see on the tests, the next request after the backend has asked for invalidation, makes the client receive a BYPASS as expected.

Again guys: if you know any company needing a Senior DevOps, willing to sponsor my relocation, drop me a message!
Thanks,
