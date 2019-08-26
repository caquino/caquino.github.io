---
layout: post
title: writing keepalived MISC_CHECKS
date: '2013-05-18T04:02:00+01:00'
tags:
- keepalived
- sysadmin
- tips
tumblr_url: http://syshero.org/post/50699853023/writing-keepalived-miscchecks
---
In some projects, I’m using [Keepalived](http://www.keepalived.org/) for failover using VRRP and load balancing managing IPVS.

Normally it’s my default choice for any new architecture, only if it’s not possible to have layer-4 load balancing because of some requirement, like for example real servers talking to virtual servers on the same subnet.
<!--more-->
Why currently, layer-4 load balancing is my default choice:

- No changes needed to the application
- Source IP addresses are tracked the same way as you had no load balancer at all
- Small footprint
- Great performance
- Lower latency

[Keepalived](http://www.keepalived.org/) has basic service checks built-in but sometimes you need to check a service that is not handled by the built-in checks, that’s when MISC_CHECKS comes at your rescue.

MISC_CHECKS allows you to use custom scripts to do service checks,  the only requirement is to be able to have custom exit codes.

Keepalived handles MISC_CHECKS spawning the check script on a predefined interval of time and checking the exit code of it.

The exit code should be 0 in case of success or 1 in case of failure.

With this in mind, you can check any service, even the most esoteric ones.

Let’s try to illustrate this with some code, and sadly, a not so imaginary problem.

Imagine that you have an old application that still using the old SQL Server driver and does not work with SQL Native Client, but will need to use this imaginary application in a mirroring enabled Microsoft SQL Server environment with failover.

The SQL Server driver does not support the Failover Partner configuration, so you need to change the ODBC configuration every time you do a failover on the database layer.

So to avoid this, you can use a [Keepalived](http://www.keepalived.org/) MISC_CHECK that checks in which of the servers the used database is in the PRINCIPAL state and only send connections to that one.

For your luck, this is just an imaginary scenario, and this will never happen in the real world, ok ok, it happened to me, I’m not as lucky as you.

You can find the MISC_CHECK at my [github repo](https://github.com/caquino/keepalived-checks), and you can use it in your virtual_server this way:

{% gist 5603080 %}
