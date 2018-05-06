---
layout: post
title: imapfilter - cleaning up your mailbox and Gmail tricks
date: '2016-06-19T15:03:35+01:00'
tags:
- devops
- productivity
- email
tumblr_url: http://syshero.org/post/146155678882/imapfilter-cleaning-up-your-mailbox-and
---
Hello friends, For the ones of you that do not know imapfilter, you should check it out, but basically, imapfilter is an IMAP client where you can write a set of rules and apply this rules to your mailbox.

imapfilter rules are written in Lua, a really simple and powerful programming language.

To start you should create a folder in your home directory called imapfilter, to do so you use the following command:

{% highlight bash %}
mkdir ~/.imapfilter
{% endhighlight %}

The configuration file should be saved at ~/.imapfilter/config.lua, after having this configuration file in place, just by running imapfilter will be enough to have your configuration executed.

To make things a little bit more interesting, let’s dissect my imapfilter configuration, where I will explain some basic features and some Gmail particularities that you should be aware if you use it.

Let’s start with some basic options that I use, and I will explain why.

{% gist cf523a99ebfe29a2d8ebb374bc6df58f %} 

- options.timeout: will specify a timeout for imapfilter to wait for the IMAP server response, if you have huge mailboxes OR if you’re planning to use the special “All mail” folder in Gmail, it’s a good idea to have a big timeout as operations may take a while.

- options.create: this will create folders that you reference in the configuration if they don’t exist.options.subscribe: this will subscribe to the created folders, basically when you create a folder does not mean that it needs to appear on the list, this will make it appear.

- options.expunge: deleting messages in folders just mark this messages for deletion, moving the messages to trash, this will remove deleted messages, this behavior can be different based on IMAP server configuration, this is the most common configuration thou.

Now let’s define our account login options.

{% gist a31480066518213f4a364a559e26ab35 %}

This block will create an object called account1, which represents our mail account.

It’s a self-explanatory block, but I do have a remark if you use 2-factor authentication on google you need to generate an application password and put it here as your password will not work.

Now, let’s start to see some basic rules I use, you will need to change the examples to match your needs, as this one was made based on my personal needs.

{% gist 27d8b48b22dda1a544e2e19aa4fd86ad %}

On this block, I’ve created a code that, in the case of Gmail, archives read and unflagged messages older than a specified period, for example in this example 30 days.

For Gmail, the function delete_messages() archive instead of delete, keep this in mind while doing your configuration.

{% gist 989eb350ba975fabc05522895c6c0070 %}

Now we will remove meeting invites older than 90 days, don’t worry if you accepted, it will be on your calendar and will not be deleted.

Note as we want to delete this messages, instead of using delete_messages() we are moving the messages to the Trash folder on Gmail.

Now let’s say we want to delete messages from some senders and based on some subjects, instead of having individual code for each, it’s simpler to use arrays to do it.

{% gist 1fe8b1115865b6c1e07dfc776158deaa %}

Again we are moving to Trash, as we want to delete this messages.

Now let’s clean up some folders where I store automated emails.

{% gist 74fe45880aabf3e3269d1344672095e1 %}

And to finish things up, we need to delete messages on our Trash by using the following code.

{% gist 6ccac22055e1a2ea435e0ccfd80adaac %}

One thing that I like to do is to move messages older than a specific period out of my INBOX to a “Cleanup” folder.

{% gist cadee6720fc566b0f5787e010a1140ab %}

All these examples should be put on the same file, called ~/.imapfilter/config.lua, or you can use includes if you want, but now you have a good baseline on how to clean up your mailbox using imapfilter.

Thanks!

See you on the next post!
