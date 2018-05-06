---
layout: post
title: Caching range requests using NGINX at MaxCDN
date: '2014-02-19T01:06:00+00:00'
tags:
- nginx
- lua
- sysadmin
- devops
- maxcdn
- cache
- proxy
tumblr_url: http://syshero.org/post/77122862845/caching-range-requests-using-nginx-at-maxcdn
---
On the end of 2013 I’ve met two amazing guys Justin Dorfman and David Archibald from MaxCDN, they were looking for a way to cache 206 Partial content.

As some of you may be aware, partial content caching using squid/varnish/nginx does not work as expected, the cache needs to download the entire file before returning partial content, and until the file is not downloaded, it returns 200.

Replying a partial request with 200 is supported as documented on RFC2616, but normally is not what you want, you want to reduce load, latency and bandwidth usage on backends, that’s why you have a reverse cache after all.

Some options to solve this are complete disabling partial content caching using, for example, proxy_no_cache $http_range or if requests have the same range, adding $http_range to proxy_cache_key.

But requests with same ranges are very unusual thus adding $http_range to your proxy_cache_key will end filling up your cache with a lot of duplicated content, so we need to find another way to solve our problem.

Answering your question: Yes, nginx caching is based on keys and not filenames or URI/URL, so it’s possible to use almost anything as your cache key.

During our brainstorming ranger was born, it guarantees that requests will always have the same range requirements thus allowing caching, basically a ‘ranger normalizer’.

On the next picture, an example of a request can be seen showing how ranger works during requests.


![Ranger Diagram]({{ "/assets/ranger.png" | absolute_url }})

Frontend, Ranger, and Cache can be located on the same nginx server, they are only application logic layers.

Basically, as I said before ranger splits requests based on specific a block size and join the response to send it back.

Its initial idea was to create an empty file and to work similar to a torrent client, but instead of adding such complexity to the code, I’ve found a way to use Lua as a 'middleware' and abstract all the caching to nginx.

ranger is written using Lua and runs embedded on nginx using the ngx_lua module, it also uses lua-resty-http to do HTTP requests.

Some features of this first release are:
- Header bypass whitelist
- HIT/MISS per range
- Bytes HIT/MISS header and logging
- Incomplete stats access

It supports all the range formats documented on RFC2616, except multi-range requests.

ranger was tested with simple range requirements, if you want to use it for something more advanced, like video streaming, for example, let me know.

Want to help improving ranger? Fork it at GitHub and send a pull request!

Don’t know Lua and found a bug? Open an issue at GitHub!

Spreading the word about ranger is a way of helping also.

Thanks, guys for giving me something to play on my free time!

agentzh released lua-resty-upstream-healthcheck, and I’m working integrating it on hipache-nginx and using custom upstreams instead of the lua-upstream-nginx-module.

I will add more documentation on the project ASAP, an example nginx config is included to help you figure out how ranger works.
