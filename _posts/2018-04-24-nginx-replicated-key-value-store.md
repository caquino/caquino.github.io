---
layout: post
title: NGINX+ - Replicated Key-Value Store
cover: /images/nginx-replicated-key-value-store/cover.svg
description: "Configuring NGINX+ modules to create a replicated key-value store using the mirror module."
date: '2018-04-24T10:00:10+01:00'
tags:
- nginx
- devops
- linux
tumblr_url: http://syshero.org/post/173254351689/nginx-replicated-key-value-store
---
Today I would like to show how two NGINX+ modules can work together to create a replicated and load balanced RESTfull key-value storage.

If you have any question, not only about NGINX, that you think that I can answer for you, feel free to leave a comment!
<!--more-->
I’ve been monitoring NGINX questions on Twitter, but let’s say that people have a really bad time asking questions, especially when they have a limited amount of characters to do so.

The current implementation of NGINX+ API has support for a key-value store, but not to replicate it, but nothing that can’t be solved if we use the mirror module.

The concept that I will show below has two NGINX+ nodes, registered in Consul.

The servers have a service called nginx-kv, and tags that identify which node is the master or slave of the cluster.

This is optional and can be done using plain DNS, but I’ve used Consul because it’s another powerful technology that can augment NGINX functionality.

On the master node we have the following configuration:

```nginx
resolver consul:8600 valid=2s ipv6=off;
resolver_timeout 2s;

keyval_zone zone=default:32k state=default.json;
keyval $arg_text $text1 zone=default;

server {
  status_zone default;

  root /usr/share/nginx/html;

  listen 80 default_server;
  server_name _;

  location /replicated {
    mirror /mirror;
    api write=on;
  }

  location /mirror {
    internal;
    proxy_set_header X-Replication-Source master;
    limit_except GET HEAD {
      proxy_pass http://slave.nginx-kv.service.consul$request_uri;
    }
  }

  location / {
    try_files $uri $uri/ index.html;
  }
}
```

The API is accessible via the URI /replicated, and every request is mirrored to /mirror.

On the /mirror location, a header X-Replication-Source with the value master is set, and I will get back to it as it’s really important.

And any request that is not GET or HEAD is mirrored via proxy_pass to the slave node.

We have no interest in mirroring GETs and HEADs to the mirror as this would waste resources.

On the slave we have the following configuration:

```nginx
keyval_zone zone=default:32k state=default.json;
keyval $arg_text $text1 zone=default;

server {
  status_zone default;

  root /usr/share/nginx/html;

  listen 80 default_server;
  server_name _;

  set $mmethod "$http_x_replication_source$request_method";

  if ( $mmethod ~ ^(POST|PUT|DELETE|PATCH)$ ) {
    return 307 http://master.nginx-kv.service.consul$request_uri;
  }

  location /replicated {
    api write=on;
  }

  location / {
    try_files $uri $uri/ index.html;
  }
}
```

The first thing to note on the slave, we have a variable that we concatenate the header X-Replicated-Source with the request_method, this way if a request comes from the master nginx, it will not be affected by the if clause.

The if clause then checks from any write operations, that is not coming from the master node, and redirect them to the master server.

This is a similar approach to LDAP updateref; the slave server is aware that it’s a slave, and redirect writes to the master.

With this in place, a simple load balancer can be added in front of the two nodes, and reads will be load balanced and writes will be sent to the master server.

I quickly presented this concept at nginx.conf 2017 in Portland, where I said that I would share more information in a blog post, took some time, but here it is!

---

**EDIT 2026-04-24.** The industry has largely moved away from the "master/slave" naming I used above. The mechanics of this design are identical whether you call the nodes "master/replica", "primary/replica", or "writer/follower"; the technique works the same. I'm leaving the post unchanged to preserve the 2018 voice, but if you're adapting this for anything new, please adopt a replacement pair.
