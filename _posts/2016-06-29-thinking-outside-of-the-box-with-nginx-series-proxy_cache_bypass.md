---
layout: post
title: Thinking outside of the box with NGINX series - proxy_cache_bypass command
date: '2016-06-29T13:31:23+01:00'
tags:
- nginx
- devops
- solution
- smart
tumblr_url: http://syshero.org/post/146652229967/thinking-outside-of-the-box-with-nginx-series
---
Hello, everyone! Time to get back to our series of posts about NGINX!

This time, let’s talk about an old friend, the proxy_cache_bypass command, which we used multiple times in my examples, but I never dedicated a post to it, so it’s time to fix this error!
<!--more-->
At first glimpse, proxy_cache_bypass feels like a simple command, one where you can bypass caching when necessary, but after reading the documentation with more attention, there was a piece of it that caught my attention.

> Note that the response from the back-end is still eligible for caching.

So basically proxy_cache_bypass not only allows you to bypass the cache but also will update our cache with the new file working similarly to a cache purge/refresh functionality.

If you want to not update cached files, you should use proxy_no_cache instead, which will have the desired behavior.

Let’s imagine that you want to bypass your cache when the requests are from your office, to do this you can use the geo module together with proxy_cache_bypass, and as a bonus, the cache will be updated as your office browse through your website.

{% gist 20a2f3ba36835b5fe344f0429df49a3f %}

Another really useful feature of proxy_cache_bypass is that you can pass multiple variables as an argument to it and if any is set it will enable the bypass action.

Some other posts I did that I used proxy_cache_bypass to update our cache:
- [Thinking outside of the box with NGINX series - split_clients command]({% post_url 2016-06-14-thinking-outside-of-the-box-with-nginx-series-split_clients %})
- [NGINX passive cache invalidation]({% post_url 2013-11-29-nginx-passive-cache-invalidation %})
- [NGINX “cache purge” emulationSee you in the next post]({% post_url 2013-05-01-nginx-cache-purge-emulation %})

Thanks!
