---
layout: page
title: 分类
permalink: /categories/
---

<div class="categories-page">
  {% assign categories_max = 0 %}
  {% for category in site.categories %}
    {% if category[1].size > categories_max %}
      {% assign categories_max = category[1].size %}
    {% endif %}
  {% endfor %}

  <div class="categories-cloud">
    {% for category in site.categories %}
      <a href="#{{ category[0] | slugify }}" class="category-cloud-item" style="font-size: {{ category[1].size | plus: 80 | divided_by: categories_max | plus: 80 }}%">
        {{ category[0] }} <span class="count">({{ category[1].size }})</span>
      </a>
    {% endfor %}
  </div>

  {% for category in site.categories %}
    <div class="category-group">
      <h2 id="{{ category[0] | slugify }}" class="category-title">
        <i class="fas fa-folder-open"></i> {{ category[0] }}
        <span class="count">{{ category[1].size }}</span>
      </h2>
      <ul class="category-posts">
        {% for post in category[1] %}
          <li class="category-post-item">
            <span class="post-date">{{ post.date | date: "%Y-%m-%d" }}</span>
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          </li>
        {% endfor %}
      </ul>
    </div>
  {% endfor %}
</div>
