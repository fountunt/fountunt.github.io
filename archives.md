---
layout: page
title: 归档
permalink: /archives/
---

<div class="archives-page">
  <p class="archives-intro">共 <strong>{{ site.posts | size }}</strong> 篇文章</p>

  {% assign posts_by_year = site.posts | group_by_exp:"post", "post.date | date: '%Y'" %}

  {% for year in posts_by_year %}
    <h2 class="archive-year">{{ year.name }}</h2>
    <ul class="archive-list">
      {% for post in year.items %}
        <li class="archive-item">
          <span class="archive-date">{{ post.date | date: "%m 月 %d 日" }}</span>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          <span class="archive-categories">
            {% for category in post.categories %}
              <span class="category-badge">{{ category }}</span>
            {% endfor %}
          </span>
        </li>
      {% endfor %}
    </ul>
  {% endfor %}
</div>
