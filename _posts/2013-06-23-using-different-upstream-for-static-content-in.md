---
layout: post
title: Using different upstream for static content in NGINX cache
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

{% gist 5843118 %}

This is just a piece of the configuration to help you understand the idea, see you next post or maybe in the sky!
