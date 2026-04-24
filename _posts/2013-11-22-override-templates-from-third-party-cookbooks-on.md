---
layout: post
title: Override templates from third-party cookbooks on chef
cover: /images/override-templates-from-third-party-cookbooks-on/cover.svg
description: "Overriding templates from third-party Chef cookbooks using custom resource definitions."
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
<!--more-->
As you will see on the next code, the way that I found was to override the resource on the rsyslog cookbook from a cookbook that I had developed.

```ruby
include_recipe "rsyslog"

begin
  t = resources(:template => "/etc/rsyslog.conf")
  t.source "rsyslog.conf.erb"
  t.cookbook "example"
rescue Chef::Exceptions::ResourceNotFound
  Chef::Log.warn "could not find template /etc/rsyslog.conf to modify"
end
```

This code instructs chef to use the file rsyslog.conf.erb, on the cookbook called example, when the resource for the file /etc/rsyslog.conf is called.

With this code, I was able to change the behavior of the default configuration of the rsyslog cookbook without touching the community cookbook.

---

**EDIT 2026-04-24.** The pattern above still compiles on modern Chef, but the current idiom is [`edit_resource`](https://docs.chef.io/workstation/chef_recipe_dsl/#edit_resource) (paired with `delete_resource` when needed), which is cleaner and skips the `rescue` block entirely.
