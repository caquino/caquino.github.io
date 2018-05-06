---
layout: post
title: NGINX+ Chained PURGE
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

{% gist a4692d5abefba4141ad6f5e9fa49ee05On %}
 
On this example, NGINX+ uses Consul to populate the backends upstream server list.

Nothing special here, no PURGE or anything just yet!

Now, to allow PURGE, Mr. J decided to go with an invalid internal domain, and this was the configuration used.

{% gist 7cd202a7d15462b48c649ac829daf63b %}

Basically, to purge any content, he can even use cli tools like curl:

{% gist e5bce397e4106e041d01fccf7a7755f5 %}

When executing a PURGE, NGINX+ will return a 204 No Content.

But still, Mr. J needed to turn this simple configuration in something that would be aware of other NGINX+ caches, and forward the PURGE requests to the other instances.

Finally  Mr. J he had a solution to his problem:

{% gist 52b9612167325f43361aea80856fed56 %}

Let’s break these into pieces and explain the important parts, first NGINX+ has an upstream called caches configuration, that’s not used by any proxy_pass:

{% gist 14ba8849cb2610f9ffa8202b9d72d560 %}

This is used as a catalog to allow instances to find each other.

Another important part is to declare where the NGINX+ Lua module will find the cjson module, as Mr. J used Ubuntu, after simply doing an apt-get install lua-cjson, he added the following line to the configuration:

{% gist fa8df1de60ee61489c3acf97f4786327 %}

And now it comes the important part, the most complex one:

{% gist e5f319f2df589c3fa7eb95e290da329c %}

When any content needs to be purged on all nodes, a PURGE request to /purger/index.html should be issued on using the host purger.local.

This will trigger the Lua code running on this location, that will call NGINX+ API and fetch a list of servers on the upstream caches.

For each server on the upstream list, Lua will execute an internal ngx.location.capture() to a proxying location, that will then send the request to the destination server. And here it’s the solution in action:

NGINX+ register themselves to Consul as the service named cache, and they are immediately available to NGINX+ cluster to be used as servers on the upstream configuration.

With this solution, the PURGE request can be sent to any NGINX+ server, and it will forward the PURGE request to all other NGINX+ nodes in the pool.

And Mr. J lived happily ever after.

I hope that Mr. J adventure helps you solve your caching issues! 

See you next time!
