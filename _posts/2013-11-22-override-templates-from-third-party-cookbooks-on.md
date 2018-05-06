---
layout: post
title: Override templates from third-party cookbooks on chef
date: '2013-11-22T04:53:29+00:00'
tags:
- sysadmins
- chef
- rsyslog
- opscode
- devops
tumblr_url: http://syshero.org/post/67727745605/override-templates-from-third-party-cookbooks-on
---
Some people prefer to develop everything from scratch, and I prefer to reuse everything if it’s possible, the only rule that I need to follow is that I need to find out a way to do it without changing a third party application.

Some months ago, because of some security requirements, I needed to change the default configuration of the rsyslog cookbook.
As you will see on the next code, the way that I found was to override the resource on the rsyslog cookbook from a cookbook that I had developed.

{% gist 7594905 %}

This code instructs chef to use the file rsyslog.conf.erb, on the cookbook called example, when the resource for the file /etc/rsyslog.conf is called.

With this code, I was able to change the behavior of the default configuration of the rsyslog cookbook without touching the community cookbook.
