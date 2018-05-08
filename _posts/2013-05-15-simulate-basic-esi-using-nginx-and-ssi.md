---
layout: post
title: simulate basic ESI using NGINX and SSI
date: '2013-05-15T15:53:00+01:00'
tags:
- nginx
- sysadmin
- tips
tumblr_url: http://syshero.org/post/50498184831/simulate-basic-esi-using-nginx-and-ssi
---
Some people may have used ESI or at least heard something about it, but if this is a new term for you,  ESI is a feature that allows you to have different caching policies for “slices” of a page or no cache at all.

For example, if you want to cache your main page for one hour, but it is not possible because you have a slice on your page that can’t be cached because it has user information, today is your luck day, ESI permits you to accomplish this task.

I think this image illustrates how it works better than words:

![Drupal ESI Varnish]({{ "/assets/drupal-esi-varnish.jpg" | absolute_url }})

You can get more information about varnish and ESI, take a look at the source of [the image](http://blog.merge.nl/2010/11/22/drupal-blocks-esi-varnish-context) above or at the [wikipedia page](http://en.wikipedia.org/wiki/Edge_Side_Includes)

[Varnish](https://varnish-cache.org/) implements this functionality, and for NGINX I found a [patch](https://github.com/taf2/nginx-esi), but I never used this patch so I can’t share any experience about it.

I always try to avoid patching software if possible, so during my research, I found out that it’s possible to do a poor man ESI using SSI on NGINX. Basically, the idea is: 

Your backend sends SSI code inside of the HTML page, and when you serve it from the cache, this SSI will be executed.

It’s not advanced as real ESI, but you can achieve a lot using this simple trick, with small changes to your code.

For example, if you have one slice of your page, like a header or a footer that needs a different TTL from the rest of the page, you can change your code to output something like this:

{% highlight html %}
<div id=“header”>
<!–# include virtual=“/content/header_page.php”  –>
</div>
{% endhighlight %}

and on your nginx.conf you can do create a location block which specifies TTL for this request.

{% highlight nginx %}
location /content {
….
   proxy_cache_valid 5m;
….
}
{% endhighlight %}

Well, at least for me examples works better than large documentation, so let’s do it :D

I have used two servers definitions in the nginx configuration to simulate a front-end and a cache, it’s not needed in a real-world environment all the files and configuration to do this proof-of-concept can be found at the gist.

{% gist 5580730 nginx.conf %}

And both SSI files used to test this server definition, the file should be saved under /var/www/uncached/index.shtml
{% gist 5580730 index-uncached.shtml %}

The second file should be saved under /var/www/cached/index.shtml
{% gist 5580730 index-cached.shtml %}

Also the index page that load both SSI pages as ESI should be saved under /var/www/index.shtml
{% gist 5580730 index.shtml %}

Let's test and verify this setup works as expected
{% gist 5580730 test-output %}
