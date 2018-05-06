---
layout: post
title: Using map for upstream configuration on NGINX
date: '2015-03-28T01:49:05+00:00'
tags:
- nginx
- devops
- sysadmin
- linux
tumblr_url: http://syshero.org/post/114804017957/using-map-for-upstream-configuration-on-nginx
---
Hi everyone, sorry for not posting any content here for such a long time.

Some of you should have noticed already that I like using map for a lot of stuff.

Another neat usage of map is to simplify your configuration, let me give you a quick example.

Imagine that you have the following configuration:

{% gist d133219ec08a50285394 %}

To simplify your configuration, you can use map with the following configuration:

{% gist 41477d0fca3b78075a68 %}

This helps to reduce the mess on the configuration made by a lot of location { … } blocks with similar configurations.
