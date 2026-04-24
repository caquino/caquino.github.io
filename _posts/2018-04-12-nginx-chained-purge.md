---
layout: post
title: NGINX+ Chained PURGE
cover: /images/nginx-chained-purge/cover.svg
description: "Implementing NGINX+ chained PURGE using Lua and Consul to dynamically update upstream server lists."
date: '2018-04-12T18:06:13+01:00'
tags:
- devops
- consul
- nginx
- syadmin
- caching
tumblr_url: http://syshero.org/post/172864680752/nginx-chained-purge
---
After a long winter, I’m here again to post about my favorite subject, wanna guess? NGINX! (Like it was hard to guess)

I will start with a story, which may or may not be based in real life, you get to choose.
<!--more-->
Once upon the time, Mr. J worked in a big company that used NGINX as their caching layer.

As the company grew, so their infrastructure, and now they needed to run multiple NGINXs (What’s the plural of NGINX BTW?), and seemed to be an easy task, turned into a complex problem.

Their applications used NGINX as a cache, and now doing cache PURGE was a lot more complex than it was before, as they needed to do it on every NGINX server as the caches were isolated from each other.

Mr. J was also worried about how this would work in the Cloud™, what about Autoscaling Groups?

All that fancy functionalities that I can leverage BUT now it’s much harder to do PURGEs.

How do I keep a list of the servers?
Do I need to call the Cloud™ API?

After some research, he had some ideas, one was to use shared storage between the caches, but he felt that this would increase the complexity even more and steered away from this option.

What about using Lua? After some research, he had some issues to overcome.

First, How to maintain a list of the NGINX nodes dynamically.

We have a way to solve this, as we use NGINX+ and Consul, we could use an upstream to have a list of the NGINX servers.

Sadly, Lua has no access to the list of servers in an upstream without extra modules, which almost drove him away from the solution!

After thinking harder, Mr. J didn’t want to add unnecessary modules to his NGINX+, which made him remember that NGINX+ has an API that can be used to query the upstream servers list.

But then, another problem! Lua has no access to external HTTP requests without extra Lua modules!

But this one was easily solved! Lua has a function to do internal HTTP requests, ngx.location.capture(), which will not work to call other external endpoints, but if we join forces between ngx.location.capture and proxy_pass we can make it work.

Mr. J continued to move forward with the mission in his mind of doing it using only what he had available to avoid increasing the complexity of his system.

After a lot of research and hard work (not really, it was done in a couple of hours, but don’t tell anyone.) Mr. J managed to come up with a solution for his problems.

Let’s imagine a simple NGINX+, which works well with a single cache node:

```nginx
proxy_cache_path /tmp/nginx levels=1:2 keys_zone=default:10m max_size=50m;

upstream backends {
  server service.consul service=backend resolve;
}

server {
  status_zone default;

  listen 80;
  server_name _;

  add_header X-Cache-Status $upstream_cache_status;
  
  location / {
    proxy_cache_valid 200 1m;
    proxy_cache default;
    proxy_cache_key $uri;
    proxy_pass http://backends;
  }

}
```

On this example, NGINX+ uses Consul to populate the backends upstream server list.

Nothing special here, no PURGE or anything just yet!

Now, to allow PURGE, Mr. J decided to go with an invalid internal domain, and this was the configuration used.

```nginx
proxy_cache_path /tmp/nginx levels=1:2 keys_zone=default:10m max_size=50m;

upstream backends {
  server service.consul service=backend resolve;
}

map $request_method $purge_method {
  PURGE 1;
  default 0;
}

server {
  status_zone purger;

  listen 80;
  server_name purger.local;

  location / {
    proxy_cache default;
    proxy_cache_key $uri;
    proxy_pass http://backends;
    proxy_cache_purge $purge_method;
  }

}
```

Basically, to purge any content, he can even use cli tools like curl:

```bash
curl -X PURGE -H 'Host: purger.local' http://127.0.0.1/uri/to/purge/index.html
```

When executing a PURGE, NGINX+ will return a 204 No Content.

But still, Mr. J needed to turn this simple configuration in something that would be aware of other NGINX+ caches, and forward the PURGE requests to the other instances.

Finally  Mr. J he had a solution to his problem:

```nginx
resolver consul:8600 valid=2s ipv6=off;
resolver_timeout 2s;

proxy_cache_path /tmp/nginx levels=1:2 keys_zone=default:10m max_size=50m;

upstream backends {
  zone backends 32k;
  server service.consul service=backend resolve;
}

upstream caches {
  zone caches 32k;
  server service.consul service=cache resolve;
}

lua_package_cpath '/usr/lib/x86_64-linux-gnu/lua/5.1/?.so;;';

server {
  status_zone default;

  listen 80;
  server_name _;

  root /usr/share/nginx/html;

  add_header X-Cache-Status $upstream_cache_status;

  location / {
    proxy_cache_valid 200 1m;
    proxy_cache default;
    proxy_cache_key $uri;
    proxy_pass http://backends;
  }

}

map $request_method $purge_method {
  PURGE 1;
  default 0;
}

server {
  status_zone purger;

  listen 80;
  server_name purger.local;

  allow 127.0.0.1;
  allow 172.16.0.0/24; # NGINX+ Network
  deny all;

  location /api {
    api write=on;
  }
  
  location ~* ^/proxy_to/(?<dest>[^\/]+)/ {
    resolver 1.1.1.1 ipv6=off;
    resolver_timeout 2s;
    proxy_method PURGE;
    proxy_set_header Host 'purger.local';
    proxy_pass http://$dest/;
  }

  location / {
    proxy_cache default;
    proxy_cache_key $uri;
    proxy_pass http://backends;
    proxy_cache_purge $purge_method;
  }

  location ~* ^/purger/(?<purge_uri>.*)$ {
   content_by_lua_block {
      local cjson = require("cjson")
      local caches = cjson.decode(ngx.location.capture('/api/3/http/upstreams/caches/servers').body)
      ngx.say('Purging URI: ' .. ngx.var.purge_uri)
      for k,v in pairs(caches) do
        if v['parent'] ~= nil then
          res = ngx.location.capture('/proxy_to/' .. v['server'] .. '/' .. ngx.var.purge_uri, { share_all_vars =  true })
          ngx.say('Purging server: ' .. v['server'] .. ' (' .. res.status .. ')')
        end
      end
    }
  }
}
```

Let’s break these into pieces and explain the important parts, first NGINX+ has an upstream called caches configuration, that’s not used by any proxy_pass:

```nginx
upstream caches {
  zone caches 32k;
  server service.consul service=cache resolve;
}
```

This is used as a catalog to allow instances to find each other.

Another important part is to declare where the NGINX+ Lua module will find the cjson module, as Mr. J used Ubuntu, after simply doing an apt-get install lua-cjson, he added the following line to the configuration:

```nginx
lua_package_cpath '/usr/lib/x86_64-linux-gnu/lua/5.1/?.so;;';
```

And now it comes the important part, the most complex one:

```nginx
server {
  status_zone purger;

  listen 80;
  server_name purger.local;

  allow 127.0.0.1;
  allow 172.16.0.0/24; # NGINX+ Network
  deny all;

  location /api {
    api write=on;
  }
  
  location ~* ^/proxy_to/(?<dest>[^\/]+)/ {
    resolver 1.1.1.1 ipv6=off;
    resolver_timeout 2s;
    proxy_method PURGE;
    proxy_set_header Host 'purger.local';
    proxy_pass http://$dest/;
  }

  location / {
    proxy_cache default;
    proxy_cache_key $uri;
    proxy_pass http://backends;
    proxy_cache_purge $purge_method;
  }

  location ~* ^/purger/(?<purge_uri>.*)$ {
   content_by_lua_block {
      local cjson = require("cjson")
      local caches = cjson.decode(ngx.location.capture('/api/3/http/upstreams/caches/servers').body)
      ngx.say('Purging URI: ' .. ngx.var.purge_uri)
      for k,v in pairs(caches) do
        if v['parent'] ~= nil then
          res = ngx.location.capture('/proxy_to/' .. v['server'] .. '/' .. ngx.var.purge_uri, { share_all_vars =  true })
          ngx.say('Purging server: ' .. v['server'] .. ' (' .. res.status .. ')')
        end
      end
    }
  }
}
```

When any content needs to be purged on all nodes, a PURGE request to /purger/index.html should be issued on using the host purger.local.

This will trigger the Lua code running on this location, that will call NGINX+ API and fetch a list of servers on the upstream caches.

For each server on the upstream list, Lua will execute an internal ngx.location.capture() to a proxying location, that will then send the request to the destination server. And here it’s the solution in action:

NGINX+ register themselves to Consul as the service named cache, and they are immediately available to NGINX+ cluster to be used as servers on the upstream configuration.

With this solution, the PURGE request can be sent to any NGINX+ server, and it will forward the PURGE request to all other NGINX+ nodes in the pool.

And Mr. J lived happily ever after.

I hope that Mr. J adventure helps you solve your caching issues!

See you next time!

---

**EDIT 2026-04-24.** The Lua code above calls `/api/3/http/upstreams/caches/servers`. Since this post was written, NGINX+ has iterated on its API (current stable is v8+). Older version paths still work because NGINX+ keeps backward compatibility on the versioned prefix, but if you're authoring new config you should point at the current version available on your build. Check `location /api { api write=on; }` output at `/api` for the versions it advertises.
