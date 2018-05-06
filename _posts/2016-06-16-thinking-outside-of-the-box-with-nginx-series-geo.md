---
layout: post
title: Thinking outside of the box with NGINX series - geo command
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

So let’s say for example that you want your QA team to always go to your preproduction environment instead of production, with [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) this can be done easily, provide your team have a fixed IP address that you match.

{% gist 514c4b62c78101441bf1efef4aa371e8 %}

Another possibility is to route a single server or a group of servers to a different upstream, for example, to do regression tests in a debug server, this is possible if you use NGINX to route the API calls through your application stack.

The [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) can also be used together with the rate limit module, allowing you to specify rules for specific netblocks, let’s say you have a global rate limit and you want to allow your special customer to be whitelisted.

{% gist 535e2e16976ea065a1526fc3a02c15dc %}

The idea here is to use the variable $binary_remote_addr for every request except for the customer network, for the customer network we will return an empty value.

On the next post, we will talk about the map command.

If you have any suggestion for a post or if you even have NGINX questions feel free to contact me through the contact link here on the blog.

As the idea of this series of posts is to show different ways of using NGINX configurations, I would like to ask for your collaboration sending questions or even guest posts.

See you in the next post, thanks!
