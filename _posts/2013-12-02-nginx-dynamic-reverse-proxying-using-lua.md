---
layout: post
title: NGINX dynamic reverse proxying using Lua
date: '2013-12-02T15:10:00+00:00'
tags:
- nginx
- lua
- dotcloud
- devops
- sysadmin
tumblr_url: http://syshero.org/post/68782243218/nginx-dynamic-reverse-proxying-using-lua
---
I was looking for interesting stuff and found a project called hipache from dotcloud written in node.js.

I start wondering if was possible to rebuild it using nginx + Lua but as it turns out, it was already made by Sam Alba from dotcloud as hipache-nginx.
<!--more-->
The hunt for more information leads me to a post on dotcloud blog explaining that they switched from the node.js version to nginx + Lua and the reasons behind it, that made even more interested on this project.

While building a lab to check it out, I found a few issues with the current version that prevented it from running.

The first issue was related to regular expression quoting.

Another issue was that the original project uses an external app to perform health checks called hipache-hchecker. It didn't work because the redis library (radix) had removed pubsub support.

So to fulfill my ‘interesting stuff’ addiction, I’ve forked the original project.

On the regular expression issue, I’ve changed the code to use Lua's find function, according to agentzh tweet, it’s faster for simple regular expressions than match.

As a workaround for the second issue, I’ve made hipache-nginx mark backends as unavailable instead of announcing in pubsub for another process to catch.

Currently, a small caveat is that a node will not return to alive state once marked as unavailable.

I’ve also changed the file structure of the project in a way that I felt cleaner to implement future features, mostly cosmetics.

You can see this fork at [my repo](https://github.com/caquino/hipache-nginx).

If you want to setup a lab too and don’t want to go through the hassle of building nginx with lua; I’ve quickly baked some ubuntu packages to help.

amd64 package: https://dl.dropboxusercontent.com/u/662720/nginx-lua/nginx_1.5.7-1~precise_amd64.deb

i386 package: https://dl.dropboxusercontent.com/u/662720/nginx-lua/nginx_1.5.7-1~precise_i386.deb

Again guys: if you know any company needing a Senior DevOps, willing to sponsor my relocation, drop me a message!

Thanks! 
