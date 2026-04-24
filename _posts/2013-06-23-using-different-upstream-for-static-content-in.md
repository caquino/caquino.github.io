---
layout: post
title: Using different upstream for static content in NGINX cache
cover: /images/using-different-upstream-for-static-content-in/cover.svg
description: "Configuring NGINX to use separate upstreams for static and dynamic content with different load balancing methods."
date: '2013-06-23T01:16:54+01:00'
tags: []
tumblr_url: http://syshero.org/post/53632583089/using-different-upstream-for-static-content-in
---
I know that you missed me because I was away from my blog for the past few weeks, but was for a good reason, I was doing skydiving lessons, I’m excited about this.

I’ve found a video that shares a little bit of the experience at Vimeo.
<!--more-->
Trust me, if you never jumped, try it!

Just to warm up the engines again, I will write about a simple but effective trick.

Sometimes when you do caching and load balancing to multiples backends, you need to use ip_hash to do backend persistence if the application does not share session state between the backends and normally we configure a single upstream to all the requests.

For static content, the session state is not needed so that you can improve your load balancing not doing persistence at all for it.
On this example two upstreams are used, one called static content without ip_hash and another one called dynamic content with ip_hash that will do persistence for the requests.

Requests for static content are sent to the upstream without persistence, based on the file extension on the URI, this is not perfect but works most of the time, for all the remaining requests the upstream dynamic content is used doing persistence.

```nginx
upstream staticcontent {
        keepalive 128;
        server backend-01:80 max_fails=5 fail_timeout=15s;
        server backend-02:80 max_fails=5 fail_timeout=15s;
        server backend-03:80 max_fails=5 fail_timeout=15s;
        server backend-04:80 max_fails=5 fail_timeout=15s;
}

upstream dynamiccontent {
        keepalive 128;
	ip_hash;
        server backend-01:80 max_fails=5 fail_timeout=15s;
        server backend-02:80 max_fails=5 fail_timeout=15s;
        server backend-03:80 max_fails=5 fail_timeout=15s;
        server backend-04:80 max_fails=5 fail_timeout=15s;
}


server {
	listen 80;

	location ~* \.(ico|js|css|png|gif|jpe?g|swf|txt|html?|htc)$ {
		expires 7d;
		proxy_next_upstream error timeout invalid_header http_500 updating;
		proxy_cache_valid 200 7d;
                proxy_set_header Host $host;
                proxy_pass http://staticcontent;
	}

	location / {
		proxy_next_upstream error timeout invalid_header http_500 updating;
		proxy_set_header Host $host;
		proxy_pass http://dynamiccontent;
	}
}
```

This is just a piece of the configuration to help you understand the idea, see you next post or maybe in the sky!

---

**EDIT 2026-04-24.** The snippet above is an excerpt. If you paste it verbatim you get two upstreams and a routing rule but no caching, because the `proxy_cache_path` directive (at the `http {}` level) and a matching `proxy_cache <zone>;` inside the static location aren't shown. Without both, the `proxy_cache_valid 200 7d;` line is a no-op.
