---
layout: post
title: Replacing spaces in URL in apache using mod_rewrite
cover: /images/replacing-spaces-in-url-in-apache-using/cover.svg
description: "RewriteRules using the [N] flag replace spaces in URLs without causing infinite loops in Apache."
date: '2013-06-23T01:20:00+01:00'
tags: []
tumblr_url: http://syshero.org/post/53632792929/replacing-spaces-in-url-in-apache-using
---
Let me tell you a small tale about a developer and an outsourced sysadmin.

The developers hired the sysadmin to fix his application issues on the infrastructure, and at those time the problem was spaces on the URL’s, and to fix this, the sysadmin learned that recursive RewriteRules are evil and can crash his loved servers.
<!--more-->
An evil bug lives on Apache previous to 2.2.12 that causes recursive RewriteRules like the one needed to cause an infinite loop.

To fix this DPI comes at your rescue.

```apacheconf
RewriteEngine on
RewriteRule ^([^\s]*)\s(.*)$ $1-$2 [R=301,N,DPI]
```

This can be used on any RewriteRule, that uses the [N] (next) flag.

And they all lived happily ever after until the next laziness attack.
