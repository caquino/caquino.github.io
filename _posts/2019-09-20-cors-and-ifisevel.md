---
layout: post
title: NGINX - CORS with a single if
date: '2019-09-20T10:00:10+01:00'
tags:
- nginx
- devops
- linux
---
Hello everyone, long time no see!

Today while working on a PR, I was thinking about how to do CORS without using ifs on NGINX.

If you are not familiar with the reasons to try to avoid using IF, you should take a look at this [post](https://www.nginx.com/resources/wiki/start/topics/depth/ifisevil/)

And as usual, map comes at our rescue!

<!--more-->

Sadly, I could not remove all IFs from the configuration as I required to use return 204 for the HTTP method OPTIONS.

{% gist b0e58140e1f7c67935bba1d618fdfa3e %}

One interesting behavior that allows this configuration to work is the fact that add_header will not add headers if the value is empty.

With that in mind, we can use maps without a default value to return empty, which disable headers when they are not necessary.

If you are only serving static assets, all the references to POST can be removed from the configuration as NGINX returns 405 if you try to POST to a static asset.

