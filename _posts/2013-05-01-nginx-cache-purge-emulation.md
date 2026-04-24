---
layout: post
title: NGINX "cache purge" emulation
cover: /images/nginx-cache-purge-emulation/cover.svg
description: "Configuring NGINX's cache_proxy_bypass to refresh cache items using custom request headers."
date: '2013-05-01T02:52:00+01:00'
tags: nginx caching proxy devops
tumblr_url: http://syshero.org/post/49324881596/nginx-cache-purge-emulation
---
I’m not a big fan of building my binaries with custom patching. Usually, I try to avoid as much as possible, maybe is some trauma from my past qmail days.

Looking for a way of purging cache items on NGINX without adding a patch to it, I found some options like [https://github.com/perusio/nginx-cache-purge](https://github.com/perusio/nginx-cache-purge), which is a good solution, but for a cache with a large number of files can be expensive.
<!--more-->
And [https://github.com/FRiCKLE/ngx_cache_purge](https://github.com/FRiCKLE/ngx_cache_purge), which works well but as I stated at the beginning of the post, I try to avoid something outside of packages.

Reading the documentation of the nginx cache module, I found one interest information about [cache_proxy_bypass](http://wiki.nginx.org/HttpProxyModule#proxy_cache_bypass):

>Note that the response from the back-end is still eligible for caching. Thus one way of refreshing an item in the cache is sending a request with a header you pick yourself!

So, in other words, it’s possible to refresh a cache item using the [cache_proxy_bypass](http://wiki.nginx.org/HttpProxyModule#proxy_cache_bypass), so let’s put this to work.

Using the configuration on the example bellow allow you to send a custom header on the request forcing the cache to bypass the request, and IF the file served is newer it will be saved on the cache overwriting the older file.

To do this you can use a bash script using wget or curl, but I enjoy building bash scripts trying to avoid external dependencies, so you can use the following configuration and script to do cache purging of single files without any patch on nginx:

Just the following configuration to nginx

```text
location / { 
	add_header X-Cached $upstream_cache_status;
	.... 
	proxy_cache_bypass $http_cache_purge;
	.... 
	proxy_pass ... ;
}
```

And to control the purge of the cache, a script similar to the following script can be used.

```bash
#!/usr/bin/env bash
echo "Before purging:"
exec 6<>/dev/tcp/127.0.0.1/80
echo -ne "GET $1 HTTP/1.0\r\n\r\n" >&6
while read -r -u 6
do
        if [[ ${REPLY} =~ ^$ ]]; then
                break
        elif [[ ${REPLY} =~ ^(Last-Modified|X-Cached):(.*)$ ]]; then
                case ${BASH_REMATCH[1]} in
                        Last-Modified)
                                echo -ne "\tFile date:\t\t${BASH_REMATCH[2]}\n"
                        ;;
                        X-Cached)
                                echo -ne "\tStatus:\t\t${BASH_REMATCH[2]}\n"
                        ;;
                esac
        fi
done
exec 6>&-
echo "Purging file."
exec 6<>/dev/tcp/127.0.0.1/80
echo -ne "GET $1 HTTP/1.0\r\nCache-Purge: 1\r\n\r\n" >&6
while read -r -u 6
do
        if [[ ${REPLY} =~ ^$ ]]; then
                break
        elif [[ ${REPLY} =~ ^(Last-Modified|X-Cached):(.*)$ ]]; then
                case ${BASH_REMATCH[1]} in
                        Last-Modified)
                                echo -ne "\tFile date:\t\t${BASH_REMATCH[2]}\n"
                        ;;
                        X-Cached)
                                echo -ne "\tStatus:\t\t${BASH_REMATCH[2]}\n"
                        ;;
                esac
        fi
done
exec 6>&-
echo "After purging:"
exec 6<>/dev/tcp/127.0.0.1/80
echo -ne "GET $1 HTTP/1.0\r\n\r\n" >&6
while read -r -u 6
do
        if [[ ${REPLY} =~ ^$ ]]; then
                break
        elif [[ ${REPLY} =~ ^(Last-Modified|X-Cached):(.*)$ ]]; then
                case ${BASH_REMATCH[1]} in
                        Last-Modified)
                                echo -ne "\tFile date:\t\t${BASH_REMATCH[2]}\n"
                        ;;
                        X-Cached)
                                echo -ne "\tStatus:\t\t${BASH_REMATCH[2]}\n"
                        ;;
                esac
        fi
done
exec 6>&-
```

Just execute it in the following way.

```bash
./ngx_cache_purge http://www.domain.com/item/to/be/purged.jpg
```
