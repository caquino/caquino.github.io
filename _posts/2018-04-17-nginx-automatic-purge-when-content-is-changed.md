---
layout: post
title: NGINX+ Automatic PURGE when content is changed
date: '2018-04-17T10:00:33+01:00'
tags:
- devops
- nginx
- linux
- caching
tumblr_url: http://syshero.org/post/173024270270/nginx-automatic-purge-when-content-is-changed
---
One of the biggest challenges for content caching is the expiration of this content, too short lived and your cache is not effective, too long, and you will serve stale data.

The sweet spot for caching is exactly to cache the content while it’s valid, which is hard as you may not know for how long your content will be valid at the moment that’s being cached.

To help with that NGINX+ has a cache purge functionality, that allows applications to send a request to NGINX+ and ask that specific content to be removed from the cache.

This requires extra application logic, which is fine, but sometimes you need to be able to purge content for applications that are not aware of the caching in front of it.

For applications that use the same URIs to read and write data based on methods, for example, let's imagine that we have a URI /profile/syshero.

If a GET is sent to /profile/syshero, the application will render and serve the output to the client.

If a PUT/POST/DELETE is sent to /profile/syshero, the application will do a write operation and change this content

This concept is similar to how REST API works, which makes this approach compatible with a large number of REST applications.

The desired solution would:

- Cache or serve cached content for GET/HEAD requests
- Purge cached content for any other HTTP method e.g.: POST, PUT, DELETE, PATCH, MKCOL, etc

The following configuration achieves that by using the NGINX+ mirror module together with the purge option.

{% gist ab3aabe5b0ba966a581ad649d7bbffe0 %}

This configuration receives any request to /, forward to the backends servers and also mirrors this request to the location /mirror.

The location /mirror will return a 204 for GET and HEAD methods as we want to avoid duplicating all our requests to the backend, and also to avoid purging the cache on every request, and for any other method that is not GET or HEAD purge the cache for the specific URI.

As can be seen on the following test:

{% gist 7a82a740a2cdbc5a67607dcacd4cb126 %}

Simple as that!

One important thing to note is that as you can see, different variables are required on both location blocks as the proxy_cache_key, and why is that? This is necessary because of how the mirror module works. To be able to have the same value on both blocks it was necessary to use $uri and $request_uri.

I would like to thank all of NGINX+ Support team for the constant help and support but especially Dmitry Pryadko that helped me figure our how to filter out methods as limit_except was not working as expected.

Also, I would like to thank Bruno Paiuca for asking this question on twitter which got me thinking about on how to solve this problem.

@nginx you need an option to purge cache after post/put/delete to works with our Rest APIs. proxy_cache_purge_after POST, PUT, DELETE— Bruno Paiuca (@BPaiuca) February 10, 2018

Thanks, everyone! See you next time!
