---
layout: layouts/default.njk
title: Mathscapes
subtitle: Research lab
cover: images/2012.png
---  

## Featured

<div class="post">
    <img src="https://cdn.mathscapes.xyz/static/images/2023/spacefill-0.2.jpg" />
    <div>
        <p class="meta">0.2.7 ≍ AE1 / Free</p>
        <p>Spacefill — Make generative patterns</p>
        <p><a href="https://new.express.adobe.com/new?category=addOns&addOnId=w466h1l71">Get for Adobe Express</a>, <a href="/notes/2023/spacefill-0.2/">Release notes</a></p>
    </div>
</div>

<div class="post">
    <img src="https://cdn.mathscapes.xyz/static/images/2023/bloom-0.1.jpg" />
    <div>
        <p class="meta">0.1.7 ≍ F7 / Free</p>
        <p>Bloom — Make L-system drawings</p>
        <p><a href="https://www.figma.com/community/plugin/1227286752522246727">Get for Figma</a>, <a href="/notes/2023/bloom-0.1/">Release notes</a></p>
    </div>
</div>

<div class="post">
    <img src="https://cdn.mathscapes.xyz/static/images/2020/geometric-0.1.jpg" />
    <div>
        <p class="meta">0.1.7 ≍ F7 / Free</p>
        <p>Geometric — Make math shapes and curves</p>
        <p><a href="https://www.figma.com/community/plugin/816329785694858088">Get for Figma</a>, <a href="/notes/2020/geometric-0.1/">Release notes</a></p>
    </div>
</div>

## Notes
  
<div>
    {%- for post in collections.post reversed -%}
    <div class="post">
        <img src="{{ post.data.cover }}" />
        <div>
            <p class="meta">{{ post.data.date | postDate }} / {{ post.data.category }} </p>
            <p><a href="{{ post.url | url }}">{{ post.data.title }}</a></p>
            {% if post.data.attrib %}<p class="meta">{{ post.data.attrib }}</p>{% endif %}
        </div>
    </div>
    {%- endfor -%}
</div>

