---
layout: post
title: Troubleshoot slow request on IIS and Apache
date: '2013-05-27T23:26:00+01:00'
tags: []
tumblr_url: http://syshero.org/post/51508627419/troubleshoot-slow-request-on-iis-and-apache
---
From time to time, I see operations-peeps struggling with web applications, trying to find out what’s causing problems on his infrastructure.

It’s even more difficult when you try to debug it, working together with the developer, usually the default excuse for both sides is: “It was working, nothing was changed.”, but the problem still exists and needs to be solved, no matter who changed it or not.

Depending on the programming language and application server used file operations are synchronous and with the advent of external integrations, like twitter or facebook for example, even when you don’t change anything, external requests can be the cause of your problem, with slower responses, causing your application to lock waiting for a response.

One way to troubleshoot this in an [Apache](https://httpd.apache.org/) environment is using [mod_status](https://httpd.apache.org/docs/2.4/mod/mod_status.html).

Having [mod_status](https://httpd.apache.org/docs/2.4/mod/mod_status.html) enabled and configured, allows you to "take a snapshot" of the requests being executed at your server in a given time.

If you have an application, that runs on multiple servers and you want to have a consolidated view, you will need to some gluing using a, for example, the bash script below:

{% gist 5658941 %}

This scripts parse the output of server-status of multiple servers and gives you the top 20 URI’s being executed at those time.

This script can be used not only to troubleshoot but for performance tuning also, helping you find out the scripts that are consuming more workers.

When you have a script working slower, and it has a large number of requests to it, it will appear on the top 20 list, allowing you to check its content and understand what’s happening.

Imagine it as a "poor man slow query log" that exists in mysql but on a webserver world.

Now, if You manage IIS webservers, AFAIK IIS has no functionality like [mod_status](https://httpd.apache.org/docs/2.4/mod/mod_status.html), but you can list requests being executed using the following command:

{% highlight powershell %}
%windir%\system32\inetsrv\appcmd list requests /elapsed:30000
{% endhighlight %}

The /elapsed parameter allows you to filter requests being executed for more than the specified amount of seconds, having a similar behavior of [Apache's](https://httpd.apache.org/) [mod_status](https://httpd.apache.org/docs/2.4/mod/mod_status.html).

Mike has an excellent post about how to troubleshoot IIS hanging requests on [his blog](http://mvolo.com/troubleshoot-iis-hanging-requests/), it’s worth looking.

In the same situation of multiple IIS’s running the same application, and you want something similar to the bash script above, you can use this ugly batch script I wrote.

{% gist 5659030 %}

To use this script just add the hostnames to the command line and It requires the [psexec](https://docs.microsoft.com/en-us/sysinternals/downloads/psexec) tool from SysInternals to be installed on the server.

I know that in some months I will be ashamed of this, I only hope not to be burned alive because of it.

Another option is to use New Relic it’s a full-fledged application monitoring SaaS, it gives much more information than those ugly scripts I wrote, and it’s worth every penny, you can try it for free.
