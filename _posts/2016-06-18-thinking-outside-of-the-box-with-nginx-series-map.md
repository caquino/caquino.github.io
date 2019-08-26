---
layout: post
title: Thinking outside of the box with NGINX series - map command
date: '2016-06-18T15:41:20+01:00'
tags:
- devops
- nginx
- smart
- solution
tumblr_url: http://syshero.org/post/146109564987/thinking-outside-of-the-box-with-nginx-series
---
I don’t think this is thinking outside the box, but I could not do a series of posts about useful commands without talking about [map](http://nginx.org/en/docs/http/ngx_http_map_module.html), arguably one of the most useful commands on NGINX, especially that I’m sure map will be used in most of our posts.
<!--more-->
You should think about [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) as a “switch” statement like many programming languages have, it’s how you will be able to take advantage of it.

Basically, the syntax for [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) is the following:

{% highlight nginx %}
map $variable_to_evaluate $return_variable { 
    value_to_match value_to_return; 
    default value_to_return_by_default;
}
{% endhighlight %}

Where the variable_to_evaluate can be ANY variable accessible by NGINX, which includes HTTP headers, Cookies, etc.

You can think of [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) as a good substitute for most “ifs” that you plan to use, especially considering that if is evil, basically [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) is a safe replacement for if in most of the situations.

Let’s review our rate limiting example that we used [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) to create a whitelist, now we will use [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) to do the same thing, if the client sends a cookie called “whitelistrl”, he will bypass the rate limiting, but remember, this is not a good idea for rate limiting control as cookies can be easily injected to any HTTP request.

{% gist ad3e6bc545258880e437a8aec4470159 %}

Another functionality is that [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) can be nested, one map can call another map or even combine [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html)/[map](http://nginx.org/en/docs/http/ngx_http_map_module.html)/[split_clients](http://nginx.org/en/docs/http/ngx_http_split_clients_module.html).

Let’s try another example, what about using [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) and [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html) to allow us to only whitelist clients from our customer network that contains the whitelistrl cookie? Sounds like fun!

{% gist 9c724bad73421b495e2ad6225b3c1e48 %}

One thing to note thou, the order of the nesting matters, [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) accepts nesting other commands, but this is not true for all commands, for example, if we had tried to call [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) from [geo](http://nginx.org/en/docs/http/ngx_http_geo_module.html), it was not going to work, so always test before deploying to production!

Also, you can see examples of [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) usage in posts right here on my blog!

Some examples are:
- [Persistent backend selection using cookies with NGINX]({% post_url 2015-07-03-persistent-backend-selection-using-cookies-with %})
- [Using map for upstream configuration on NGINX]({% post_url 2015-03-28-using-map-for-upstream-configuration-on-nginx %})
- [Disable NGINX cache based on cookies]({% post_url 2013-05-10-disable-nginx-cache-based-on-cookies %})
- [Avoid caching 0-byte files on NGINX]({% post_url 2013-05-04-avoid-caching-0-byte-files-on-nginx %})

See you on the next post! 

If you have any question or suggestion, use the Ask-O-matic link on the top of the page.

Thanks!
