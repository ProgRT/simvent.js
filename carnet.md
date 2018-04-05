---
---
  <dl class="post-list">
    {% for post in site.posts %}
        <dt class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</dt>

      <dd>
          <a class="post-link" href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
      </dd>
    {% endfor %}
  </dl>
