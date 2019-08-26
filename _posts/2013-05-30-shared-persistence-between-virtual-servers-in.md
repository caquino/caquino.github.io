---
layout: post
title: Shared persistence between virtual servers in keepalived
date: '2013-05-30T17:02:10+01:00'
tags: []
tumblr_url: http://syshero.org/post/51729932595/shared-persistence-between-virtual-servers-in
---
If you are afraid of reading this long post TL;DR to have shared persistence you will need to use iptables fwmark or service port 0 on keepalived, but if you are brave enough to read it, let’s start from the basics.

First, we need to understand the difference between persistence algorithm and scheduling algorithm.
<!--more-->
The scheduling algorithm is used to choose the server that your connection will go.

Persistence algorithm is used to tell if your connections will always go to the same server.

Some scheduling algorithms do persistence like source IP algorithm, sometimes this causes a misunderstanding of the difference between them.

An example of persistence is cookie persistence, it injects a cookie on HTTP/HTTPS headers identifying the server that has the user session.

My default choice for scheduling algorithm is least connections, it sends the connections to the server with the least number of established connections, normally the faster server.
More detailed information about load balancing can be found at Wikipedia.

Different kinds of load balancing exist like layer 7, layer 4, DNS round robin and etc, but It’s out of the topic of this post, maybe I do a different post about it later.

Persistence needs to be used according to the application load balanced, if the application does not share the user session state between the servers and it relies on sessions, you need to use persistence.

Keepalived supports persistence, but it’s not shared between different virtual_server, if your application uses more than one virtual_server, like HTTP and HTTPS, and you need to direct the user to the same server, you can do in two different ways.

One:
Configuring your virtual_server port as 0, but this has some drawbacks, one of this is the fact that all ports will be balanced, if your server, for example, have ssh listening on the same IP it will be load balanced too.

{% gist 5678442 %}

Even doing this you can load balance others services on the same VIP, understand this as a “fallback” service, any port that is not defined will be handled by this virtual_server, having persistence on different ports.

Two:
Using iptables firewall mark to control the ports handled by the virtual_server.

{% gist 5678420 %}

Every packet that you mark using iptables will be directed to the virtual_server, it’s not difficulty but is one external point that can’t be overlooked during troubleshooting.

This is more secure than the previous option and allows you to have more control of your environment.

Just one caveat not related to load balancing; session state is not shared between HTTP/HTTPS connections, even doing this, security settings of modern web browsers do not allow data to be shared between different ports, you can achieve persistence between both services sending the session identifier on the URL and using this identifier to read the session data, the load balancer will only guarantee that the user will go to the same server to allow you read this session data.

FIX: thanks JP for pointing out that I was missing the -t mangle on the iptables commands. 
