---
layout: layouts/default.njk
title: Mathscapes
subtitle: Research lab
cover: images/2012.png
---  
   
Mathscapes is a small research group that creatively experiments with abstract mathematical ideas, connecting the dots to a deeper understanding of the world around us. We build accessible tools, conduct research, and collaborate with researchers, educators, and creators to make mathematics and research more accessible.

<h2>Featured</h2>

<div class="post">
    <img src="https://cdn.mathscapes.xyz/static/images/2023/spacefill-0.2.jpg" />
    <div>
        <p class="meta">0.2.3 ≍ AE1 / Free</p>
        <p>Spacefill — Make generative patterns</p>
        <p>Coming soon, <a href="/notes/spacefill/0.2/">Pre-release notes</a></p>
    </div>
</div>

<div class="post">
    <img src="https://cdn.mathscapes.xyz/static/images/2023/bloom-0.1.jpg" />
    <div>
        <p class="meta">0.1.6 ≍ F6 / Free</p>
        <p>Bloom — Make L-system drawings</p>
        <p><a href="https://www.figma.com/community/plugin/1227286752522246727">Get for Figma</a>, <a href="/notes/bloom/0.1/">Release notes</a></p>
    </div>
</div>

<div class="post">
    <img src="https://cdn.mathscapes.xyz/static/images/2020/geometric-0.1.jpg" />
    <div>
        <p class="meta">0.1.4 ≍ F4 / Free</p>
        <p>Geometric — Make math shapes and curves</p>
        <p><a href="https://www.figma.com/community/plugin/816329785694858088">Get for Figma</a>, <a href="/notes/geometric/0.1/">Release notes</a></p>
    </div>
</div>

<h2>Notes</h2>
  
<div>
    {%- for post in collections.post reversed -%}
    <div class="post">
        <img src="{{ post.data.cover }}" />
        <div>
            <p class="meta">{{ post.data.date | postDate }} / {{ post.data.category }} </p>
            <p><a href="{{ post.url | url }}">{{ post.data.title }}</a></p>
        </div>
    </div>
    {%- endfor -%}
</div>
  
Notes marked with [] are collaborative work. (+) indicates additional contribution from more people, including peers, mentors, or students. Names are sorted by first letter.

GS: Gaurav Singh, PO: Prakhar Ojha, SS: Simran Singh, SW: Swati Sharma
 
