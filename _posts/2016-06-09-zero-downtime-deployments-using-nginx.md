---
layout: post
title: Zero-downtime deployments using NGINX
date: '2016-06-09T02:02:10+01:00'
tags: []
tumblr_url: http://syshero.org/post/145635145517/zero-downtime-deployments-using-nginx
---
Hello, everyone! Missed posting here, I should say that I need to start posting again!

As many of you know, some application servers do not support zero downtime deployments or even rolling restarts, and no, I’m not talking about unicorn, unicorn supports this out of the box.
<!--more-->
One possible solution to be able to do zero-downtime deployments on such application servers is to use NGINX and some basic shell scripting.

The concept is that you run a local NGINX in front of such application server and during a deployment you spin up a second instance of the application server in a different port, having temporarily two copies of the application running.

For the sake of this example let’s say we have a configuration file called zerodowntime.conf and the application runs on the ports 8001 and 8002.

To be able to execute the zero-downtime deployment you just need to switch the "down" flag on the upstream configuration to the old backend, which will not receive any new connections, but will finish processing the existing ones and remove the down flag from the new instance, which will start to receive all the new traffic.

I’ve added a configuration example and a simple shell script to do the backend switch, but this can be easily improved, like for example adding some curl requests to the backends to check if they are up.

After the configuration changes, the last step necessary is just to send a reload signal to the NGINX process and voilá!

Your new application server is processing all the new requests!

The following configuration is a simple example of how to achieve such functionality with minimal configuration. 

{% gist 32e50922059aadcc75e787c62ae956c8 %}

I hope this will be useful for some poor soul suffering trying to do zero-downtime deployments.

Thanks!
