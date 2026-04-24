---
layout: post
title: Troubleshoot slow request on IIS and Apache
cover: /images/troubleshoot-slow-request-on-iis-and-apache/cover.svg
description: "Troubleshooting slow requests on IIS and Apache using mod_status and command-line tools."
date: '2013-05-27T23:26:00+01:00'
tags: []
tumblr_url: http://syshero.org/post/51508627419/troubleshoot-slow-request-on-iis-and-apache
---
From time to time, I see operations-peeps struggling with web applications, trying to find out what’s causing problems on his infrastructure.

It’s even more difficult when you try to debug it, working together with the developer, usually the default excuse for both sides is: “It was working, nothing was changed.”, but the problem still exists and needs to be solved, no matter who changed it or not.
<!--more-->
Depending on the programming language and application server used file operations are synchronous and with the advent of external integrations, like twitter or facebook for example, even when you don’t change anything, external requests can be the cause of your problem, with slower responses, causing your application to lock waiting for a response.

One way to troubleshoot this in an [Apache](https://httpd.apache.org/) environment is using [mod_status](https://httpd.apache.org/docs/2.4/mod/mod_status.html).

Having [mod_status](https://httpd.apache.org/docs/2.4/mod/mod_status.html) enabled and configured, allows you to "take a snapshot" of the requests being executed at your server in a given time.

If you have an application, that runs on multiple servers and you want to have a consolidated view, you will need to some gluing using a, for example, the bash script below:

```bash
#!/usr/bin/env bash
WEBSERVERS="apache1.domain.com apache2.domain.com apache3.domain.com apache4.domain.com"
for server in ${WEBSERVERS};do
    wget -q -O - ${server}/server-status | grep 'HTTP' | \
    while IFS=$'\n' read; do
        if [[ ${REPLY} =~ (GET|POST|HEAD)\ (.+?)\ HTTP ]]; then
            echo ${BASH_REMATCH[2]}
        fi | grep -v server-status
    done
done | sort | uniq -c | sort -rk1 | head -20
```

This scripts parse the output of server-status of multiple servers and gives you the top 20 URI’s being executed at those time.

This script can be used not only to troubleshoot but for performance tuning also, helping you find out the scripts that are consuming more workers.

When you have a script working slower, and it has a large number of requests to it, it will appear on the top 20 list, allowing you to check its content and understand what’s happening.

Imagine it as a "poor man slow query log" that exists in mysql but on a webserver world.

Now, if You manage IIS webservers, AFAIK IIS has no functionality like [mod_status](https://httpd.apache.org/docs/2.4/mod/mod_status.html), but you can list requests being executed using the following command:

```powershell
%windir%\system32\inetsrv\appcmd list requests /elapsed:30000
```

The /elapsed parameter allows you to filter requests being executed for more than the specified amount of seconds, having a similar behavior of [Apache's](https://httpd.apache.org/) [mod_status](https://httpd.apache.org/docs/2.4/mod/mod_status.html).

Mike has an excellent post about how to troubleshoot IIS hanging requests on [his blog](http://mvolo.com/troubleshoot-iis-hanging-requests/), it’s worth looking.

In the same situation of multiple IIS’s running the same application, and you want something similar to the bash script above, you can use this ugly batch script I wrote.

```batchfile
@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION
FOR %%A IN (%*) DO (
  PSEXEC.EXE \\%%A %windir%\system32\inetsrv\appcmd list requests  > %TMP%\output-%%A.log 2>&1
)
FOR %%A IN (%*) DO (
	TYPE %TMP%\output-%%A.log | FIND "REQUEST" >> %TMP%\output.log
	DEL %TMP%\output-%%A.log
)
FOR /F "tokens=2,3 delims==:" %%A IN (%TMP%\output.log) DO ECHO %%A | SORT >> %TMP%\outputs.log
FOR /F "tokens=1,2 delims==," %%A IN (%TMP%\outputs.log) DO ECHO %%A | SORT >> %TMP%\outputc.log
FOR /F "tokens=1,2 delims==?" %%A IN (%TMP%\outputc.log) DO ECHO %%A | SORT >> %TMP%\outputq.log
FOR /F "tokens=1,2 delims==?" %%A IN (%TMP%\outputq.log) DO (
	IF DEFINED ELEMS["%%A"] (
		SET C=!ELEMS["%%A"]!
		SET /A C+=1
		SET ELEMS["%%A"]=!C!
	) ELSE (
		SET ELEMS["%%A"]=1
	)
)
FOR /F "tokens=1,2 delims==?" %%A IN (%TMP%\outputq.log) DO (
	IF !ELEMS["%%A"]! GTR 0 (
		ECHO !ELEMS["%%A"]! %%A >> %TMP%\result.log
		SET ELEMS["%%A"]=0
	)
) 
TYPE %TMP%\result.log | SORT /+1 /R | MORE
ENDLOCAL
DEL %TMP%\output.log
DEL %TMP%\output?.log
DEL %TMP%\result.log
```

To use this script just add the hostnames to the command line and It requires the [psexec](https://docs.microsoft.com/en-us/sysinternals/downloads/psexec) tool from SysInternals to be installed on the server.

I know that in some months I will be ashamed of this, I only hope not to be burned alive because of it.

Another option is to use New Relic it’s a full-fledged application monitoring SaaS, it gives much more information than those ugly scripts I wrote, and it’s worth every penny, you can try it for free.
