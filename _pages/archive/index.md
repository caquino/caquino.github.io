---
layout: default
title: Archive
permalink: /archive/
---

<header class="archive-header">
    <h1>Archive <span class="archive-term">all {{ site.posts.size }} posts</span></h1>
</header>

{% assign posts_by_year = site.posts | group_by_exp: "p", "p.date | date: '%Y'" %}
{% for year in posts_by_year %}
<section class="archive-year">
    <h2 class="archive-year-label">{{ year.name }}</h2>
    <ul class="archive-list">
    {% for post in year.items %}
        <li>
            <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%d %b" }}</time>
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </li>
    {% endfor %}
    </ul>
</section>
{% endfor %}
