---
layout: post
title: SSL acceleration using NGINX and backend SSL connection identification
date: '2016-06-09T17:58:47+01:00'
tags: []
tumblr_url: http://syshero.org/post/145664994617/ssl-acceleration-using-nginx-and-backend-ssl
---
One common trick to optimize SSL termination performance is to have a proxy terminating all the SSL connections and proxying the connection to a plain HTTP backend.

This, in theory, works very well and without any code changes, but in practice, you discover that after doing this your application can’t tell the difference between HTTP and HTTPS clients.
<!--more-->
The most common issue is that the application creates a redirect loop trying to redirect the user to HTTPS because the application is not able to know that the user is already using HTTPS. 

But how to solve this issue? The most common method is to use an HTTP Header to identify SSL/non-SSL connections, this way the application can know which protocol was used on the request.

The header used for this purpose is X-Forwarded-Proto, which can be added to the upstream request using proxy_set_header, as we want this header to be sent to the backend servers and not to the clients.

With this header in place, the application can take actions by evaluating the value set on it.

The following example sets the X-Forwarded-Proto header and forwards the connection to our backend using proxy_pass.

{% gist 6f477ad445d1e508141263d055d136dd %}
