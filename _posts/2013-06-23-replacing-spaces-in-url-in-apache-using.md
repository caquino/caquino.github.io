---
layout: post
title: Replacing spaces in URL in apache using mod_rewrite
date: '2013-06-23T01:20:00+01:00'
tags: []
tumblr_url: http://syshero.org/post/53632792929/replacing-spaces-in-url-in-apache-using
---
Let me tell you a small tale about a developer and an outsourced sysadmin.

The developers hired the sysadmin to fix his application issues on the infrastructure, and at those time the problem was spaces on the URL’s, and to fix this, the sysadmin learned that recursive RewriteRules are evil and can crash his loved servers.
<!--more-->
An evil bug lives on Apache previous to 2.2.12 that causes recursive RewriteRules like the one needed to cause an infinite loop.

To fix this DPI comes at your rescue.

{% gist 5843197 %}

This can be used on any RewriteRule, that uses the [N] (next) flag.

And they all lived happily ever after until the next laziness attack.
