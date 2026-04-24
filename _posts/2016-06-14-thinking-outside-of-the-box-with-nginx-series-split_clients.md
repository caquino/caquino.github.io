---
layout: post
title: Thinking outside of the box with NGINX series - split_clients command
series: "Thinking outside the box with NGINX"
cover: /images/thinking-outside-of-the-box-with-nginx-series-split_clients/cover.svg
description: "Using split_clients to bypass cache for a percentage of requests and direct traffic to different backend versions."
date: '2016-06-14T00:07:20+01:00'
tags:
- nginx
- devops
- smart
- solution
tumblr_url: http://syshero.org/post/145880203947/thinking-outside-of-the-box-with-nginx-series
---
I think it’s time for me to start a series of posts about useful NGINX commands, and different ways of solving common problems using NGINX and to start this series, let’s talk about [split_clients](http://nginx.org/en/docs/http/ngx_http_split_clients_module.html).
<!--more-->
[split_clients](http://nginx.org/en/docs/http/ngx_http_split_clients_module.html) was built with A/B testing in mind, but it’s not the only possible way of using it, it’s way more powerful than it’s original design.

let’s start with some examples, the first one I like to call it limited caching and renewal, the idea is that you have a cache in front of your application, where X% of the requests will hit the upstream servers and update the cached version.

For this example let’s consider that we have an upstream group called limitedcache and that 10% of my requests will be sent to the backend and renew my cached file and the other 90% of the requests will receive our cached page instead.

The key used for [split_clients](http://nginx.org/en/docs/http/ngx_http_split_clients_module.html) on this example is a “pseudo-random” variable that tries to split 10% of the requests in a different bucket to trigger the bypass action on NGINX, that’s why date_gmt is used on it.The key commands in this example are split_clients, proxy_cache_bypass, proxy_cache_use_stale and proxy_cache_lock.

Again we are abusing proxy_cache_bypass to create a poor mans “PURGE” functionality.

```nginx
split_clients "cache${remote_addr}${http_user_agent}${date_gmt}" $update_cache {
  10% 1;
  *   0;  
}

upstream limitedcache {
  server 192.168.0.1:80;
  server 192.168.0.2:80;
}

proxy_cache_path /data/nginx/cache/ levels=1:2 keys_zone=cache:256m inactive=24h;

server {
  listen 80;
  location / {
    proxy_cache_bypass $update_cache;
    proxy_cache_valid any 10m;
    proxy_cache cache;
    proxy_cache_use_stale error timeout updating http_502;
    proxy_cache_lock on; # only allow one request at time to update the cache, other requests will receive stale cache copy (race condition)
    proxy_cache_lock_timeout 30s;
    proxy_cache_min_uses 1;
    proxy_pass http://limitedcache;
  }
}
```

Another interesting usage of [split_clients](http://nginx.org/en/docs/http/ngx_http_split_clients_module.html), that’s closer to the A/B testing idea is that you can use it to do load testing/regression tests on new deployments.

The idea here is that you can send X% of your requests to a set of backends running the new version of the code that you want to test.

On the following example, we will send 10% of our requests to a group of backends called testing that is running the new code that we want to test.

```nginx
split_clients "cache${remote_addr}${http_user_agent}${date_gmt}" $upstream_group {
  10% "testing";
  *   "production";  
}

upstream production {
  server 192.168.0.1:80;
  server 192.168.0.2:80;
}

upstream testing {
  server 192.168.0.3:80;
  server 192.168.0.4:80;
}

server {
  listen 80;
  location / {
    proxy_pass http://$upstream_group;
  }
}
```

But remember, this example will only work well for stateless applications if yours need persistence check it out [this example](https://www.viget.com/articles/split-test-traffic-distribution-with-nginx/).

You can also find some nice usage of [split_clients](http://nginx.org/en/docs/http/ngx_http_split_clients_module.html) at [this post](https://www.nginx.com/blog/nginx-caching-guide/) under Splitting the Cache Across Multiple Hard Drives and also [how to overcome ephemeral port limit using split clients](https://www.nginx.com/blog/overcoming-ephemeral-port-exhaustion-nginx-plus/)

On the next post, we will talk about the [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) command

If you have any suggestion for a post or if you even have NGINX questions feel free to contact me through the contact link here on the blog.

As the idea of this series of posts is to show different ways of using NGINX configurations, I would like to ask for your collaboration sending questions or even guest posts.

See you in the next post, thanks!
