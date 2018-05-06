---
layout: post
title: DNS Round Robin, Consul and Java
date: '2018-04-26T14:06:22+01:00'
tags:
- devops
- consul
- dns
tumblr_url: http://syshero.org/post/173322730772/dns-round-robin-consul-and-java
---
Hello everyone! Today, for a change, I will be talking about Consul from Hashicorp instead of NGINX.

I will start with the assumption that you’re aware of what a DNS round robin is and how it’s supposed to work and evolve from there.

I would like to start saying that the “problem” we faced, it’s not related to Consul, but the solution that we looked for was for Consul.

Today Rafael while troubleshooting some uneven load distribution across his services, noticed an unexpected behavior.

He had his service correctly configured in Consul, the DNS response from Consul was returning the expected information, but still, only one node was receiving all the requests.

First of all, we started to take a look at java DNS lookup functionality to understand what could cause this issue, especially that both of us saw Greg Banks presentation about Java’s internal DNS caching, which threw us out a little bit.

After doing some tests disabling Java’s internal DNS caching and still having the same issue, we started to break the problem into pieces and test piece by piece, which we should’ve done since the beginning.

We started doing direct DNS queries to Consul to verify that the DNS response was what we expected to be, and it was, so we know that the problem is not Consul.

The next step on our DNS path is the local dnsmasq, which also proved to be working as expected after some simple DNS queries.

Now we were to a point where the DNS path leads us back to Java-land, which we tested before and looked OK.

But just to be sure that Java was the issue and not something else, we tried to use curl, after all the DNS path for both will be the same, and to our surprise, curl had the same behavior that Java had.

After this test, we can safely assume, that what’s causing this issue, it’s not only on Java-land, but we also know that’s NOT on DNS land, so what is the problem? Where to go now?

While trying to search for more information, regarding DNS round robin, we found this post written in 2012 by Daniel Stenberg curl lead developer, which gave us more clues about our problem.

The short version is that most applications used gethostbyname to make DNS requests, which will just give you a randomly ordered list of hosts, which makes DNS round robin work as expected.

But gethostbyname was built to support IPv4 and with IPv6 
a new function was required, this is when getaddrinfo comes to play.

The “problem” is that getaddrinfo implements RFC3484 which returns the address always in a specific order, thus breaking DNS round robin, which relied on the random order from gethostbyname.

The idea is that when using getaddrinfo, the application should control the desired behavior, for example, grabbing a random IP from the list, or trying in order until you find one that’s working.

In one hand, this is good as it gives applications more control over the desired behavior, but on the other hand, it makes the behavior inconsistent as each application do whatever they want.

Now that we knew what we were facing, we had some options, change our internal application to control this, or figure out a way to make our application work as it worked on the good old gethostbyname times.

And for our surprise, Consul had a clever workaround for this issue, which limit the size of the answer, and returns a random IP from the list instead of returning the full list and assume that the client application handles it as expected.

This has some trade-offs, for example, DNS TTL needs to be shorter as the DNS RR will rely on returning a different address for each query, which may increase the load on your DNS infrastructure and Consul.

But this will solve our issue until we have a more consistent behavior from applications using getaddrinfo.

For some extra information, you can also take a look at this post at Consul’s mailing list.

That’s all for today!

Thanks
