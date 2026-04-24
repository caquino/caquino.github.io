---
layout: post
title: NGINX syslog-ing without breaking the bank or patching the code
cover: /images/nginx-syslog-ing-without-breaking-the-bank-or/cover.svg
description: "Configuring NGINX to log to syslog using a FIFO and syslog-ng."
date: '2013-11-26T17:24:00+00:00'
tags: []
tumblr_url: http://syshero.org/post/68174083489/nginx-syslog-ing-without-breaking-the-bank-or
---
After seeing a problem reported by a fellow devops on his post at HackerNews, I decided to spin up a lab trying to help to find a solution besides ditching nginx.

About his post, TL;DR the free nginx can’t log to syslog.
<!--more-->
My idea was to configure nginx writing to a FIFO and use rsyslog reading from it.

While testing rsyslog I found that to make it open the fifos you need to first write something on the fifos, this is a no-go for me.

With this information in hands I started looking for alternatives and tried syslog-ng, and it worked.

My tests were conducted only to test functionality and not the performance of this setup.

On my tests, if syslog-ng stops for any reason, nginx will silently discard the logs.

I’ve tried to generate enough requests to fill up the log buffer with syslog-ng offline, but I was not able to make nginx stop serving requests.

First of all, you need to create the fifos, I’ve used one directory outside /var/log to not be surprised by any logrotate rules.

```bash
mkdir -p /srv/logs/
mkfifo /srv/logs/access.log
mkfifo /srv/logs/error.log
```

Now you need to configure syslog-ng to read from the FIFO using the following configuration.

```nginx
source s_nginx_20 { pipe("/srv/logs/access.log" program_override("nginx-access-log")); };
source s_nginx_21 { pipe("/srv/logs/error.log" program_override("nginx-error-log")); };

filter f_nginx_20 { match("nginx-access-log" value("PROGRAM")); };
filter f_nginx_21 { match("nginx-error-log" value("PROGRAM")); };

destination d_remote { tcp("central.syslog", port(514)); };

log { source(s_nginx_20); filter(f_nginx_20); destination(d_messages); };
log { source(s_nginx_21); filter(f_nginx_21); destination(d_messages); };
```

To send the logs to a remote server just change the destination.
On nginx side just configure access_log and error_log to write on the fifos.

```nginx
error_log /srv/logs/error.log;
access_log /srv/logs/access.log;
```

Keep in mind that your syslog-ng needs to be started before nginx, or it will hang on startup.

After writing this post, I saw some people arguing about I/O usage and pipes/fifos, let me quote a piece of the man page of 7 FIFO.


>A FIFO special file (a named pipe) is similar to a pipe, except that it is accessed as part of the file system. It can be opened by multiple processes for reading or writing. When processes are exchanging data via the FIFO, the kernel passes all data internally without writing it to the file system. Thus, the FIFO special file has no contents on the file system; the file system entry merely serves as a reference point so that processes can access the pipe using a name in the file system.


Having nginx supporting syslog protocol is the best solution, but for a project that can’t justify paying for this feature or the time spent taking care of custom packages and patching, this may be a solution.

By the way: if you know any company in Toronto needing a Senior DevOps, drop me a message!

---

**EDIT 2026-04-24.** NGINX OSS has supported syslog output natively since [nginx 1.7.1 (June 2014)](http://nginx.org/en/CHANGES), a few months after this post was written. These days the syntax is just `error_log syslog:server=host:514 ...;` on the `error_log` and `access_log` directives, and the whole FIFO + syslog-ng pipeline below is no longer needed. I'm keeping the post up because, at the time, the "free nginx can't log to syslog" complaint had just hit the HN front page (this was my response), and the fuss around that thread is part of how I ended up at Zendesk.

Thanks!
