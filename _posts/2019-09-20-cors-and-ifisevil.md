---
layout: post
title: NGINX - CORS with a single if
cover: /images/cors-and-ifisevil/cover.svg
description: "Configuring NGINX CORS with a single if using maps and add_header directives."
date: '2019-09-20T10:00:10+01:00'
tags:
- nginx
- devops
- linux
---
Hello everyone, long time no see!

Today while working on a PR, I was thinking about how to do CORS without using ifs on NGINX.

If you are not familiar with the reasons to try to avoid using IF, you should take a look at this [post](https://www.nginx.com/resources/wiki/start/topics/depth/ifisevil/)

And as usual, [map](http://nginx.org/en/docs/http/ngx_http_map_module.html) comes at our rescue!

<!--more-->

Sadly, I could not remove all IFs from the configuration as I required to use return 204 for the HTTP method OPTIONS.

```nginx
# Origin whitelist
map $http_origin $allowed_origin {
  default             "false";

  "~*\.?test\.com"    "true";
  "~*\.?example\.com" "true";
}

# Methods
map $request_method $cors {
  "OPTIONS" "${allowed_origin}options";
  "GET"     "${allowed_origin}get";
  "POST"    "${allowed_origin}post";
  default   "${allowed_origin}";
}

# Access-Control-Allow-Origin, if cors true add header.
map $cors $acao {
  "~^true.+?" "$http_origin";
}

# Access-Control-Allow-Credentials, and method is GET/POST/OPTIONS and cors true add header.
map $cors $acac {
  "~^true(options|get|post)" "true";
}

# Access-Control-Allow-Methods, and method is GET/POST/OPTIONS and cors true add header.
map $cors $acam {
  "~^true(options|get|post)" "GET, POST, OPTIONS";
}

# Access-Control-Allow-Headers, and method is GET/POST/OPTIONS and cors true add header.
map $cors $acah {
  "~^true(options|get|post)" "Keep-Alive,User-Agent,ETag,Last-Modified,Vary,If-Modified-Since,Cache-Control,Content-Type";
}

# Access-Control-Max-Age, and method is OPTIONS and cors true add header.
map $cors $acma {
  "trueoptions" "1728000";
}

server {
  listen 80 default_server reuseport;
  expires 24h;

  root /usr/share/nginx/html;
  index index.html index.htm;

  location / {
    add_header 'Access-Control-Allow-Origin' $acao;
    add_header 'Access-Control-Allow-Credentials' $acac;
    add_header 'Access-Control-Allow-Methods' $acam;
    add_header 'Access-Control-Allow-Headers' $acah;
    add_header 'Access-Control-Max-Age' $acma;

    if ($request_method = "OPTIONS") {
      return 204;
    }

    try_files $uri $uri/ =404;
  }
}
```

One interesting behavior that allows this configuration to work is the fact that [add_header](http://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header) will not add headers if the value is empty.

With that in mind, we can use [maps](http://nginx.org/en/docs/http/ngx_http_map_module.html) without a default value to return empty, which disable headers when they are not necessary.

If you are only serving static assets, all the references to POST can be removed from the configuration as NGINX returns 405 if you try to POST to a static asset.

