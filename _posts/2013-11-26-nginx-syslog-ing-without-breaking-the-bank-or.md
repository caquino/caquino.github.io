---
layout: post
title: NGINX syslog-ing without breaking the bank or patching the code
date: '2013-11-26T17:24:00+00:00'
tags: []
tumblr_url: http://syshero.org/post/68174083489/nginx-syslog-ing-without-breaking-the-bank-or
---
After seeing a problem reported by a fellow devops on his post at HackerNews, I decided to spin up a lab trying to help to find a solution besides ditching nginx.

About his post, TL;DR the free nginx can’t log to syslog.

My idea was to configure nginx writing to a FIFO and use rsyslog reading from it.

While testing rsyslog I found that to make it open the fifos you need to first write something on the fifos, this is a no-go for me.

With this information in hands I started looking for alternatives and tried syslog-ng, and it worked.

My tests were conducted only to test functionality and not the performance of this setup.

On my tests, if syslog-ng stops for any reason, nginx will silently discard the logs.

I’ve tried to generate enough requests to fill up the log buffer with syslog-ng offline, but I was not able to make nginx stop serving requests.

First of all, you need to create the fifos, I’ve used one directory outside /var/log to not be surprised by any logrotate rules.

{% highlight bash %}
mkdir -p /srv/logs/
mkfifo /srv/logs/access.log
mkfifo /srv/logs/error.log
{% endhighlight %}

Now you need to configure syslog-ng to read from the FIFO using the following configuration.

{% gist 7661837 %}

To send the logs to a remote server just change the destination.
On nginx side just configure access_log and error_log to write on the fifos.

{% highlight nginx %}
error_log /srv/logs/error.log;
access_log /srv/logs/access.log;
{% endhighlight %}

Keep in mind that your syslog-ng needs to be started before nginx, or it will hang on startup.

After writing this post, I saw some people arguing about I/O usage and pipes/fifos, let me quote a piece of the man page of 7 FIFO.


>A FIFO special file (a named pipe) is similar to a pipe, except that it is accessed as part of the file system. It can be opened by multiple processes for reading or writing. When processes are exchanging data via the FIFO, the kernel passes all data internally without writing it to the file system. Thus, the FIFO special file has no contents on the file system; the file system entry merely serves as a reference point so that processes can access the pipe using a name in the file system.


Having nginx supporting syslog protocol is the best solution, but for a project that can’t justify paying for this feature or the time spent taking care of custom packages and patching, this may be a solution.

By the way: if you know any company in Toronto needing a Senior DevOps, drop me a message!

Thanks!
