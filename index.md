---
layout: layouts/default.njk
title: Mathscapes
subtitle: Research lab
cover: images/2012.png
---  
   
Mathscapes is a small research group that creatively experiments with abstract mathematical ideas, connecting the dots to a deeper understanding of the world around us. We build accessible tools, conduct research, and collaborate with researchers, educators, and creators to make mathematics and research more accessible.

<h2>Notes</h2>
  
<div>
    {%- for post in collections.post reversed -%}
    <div class="post">
        <img src="{{ post.data.cover }}" />
        <div>
            <p class="meta">{{ post.data.date | postDate }} • {{ post.data.category }} </p>
            <p><a href="{{ post.url | url }}">{{ post.data.title }}</a></p>
        </div>
    </div>
    {%- endfor -%}
</div>
  
Notes marked with [] are collaborative work. (+) indicates additional contribution from more people, including peers, mentors, or students. Names are sorted by first letter.

GS: Gaurav Singh, PO: Prakhar Ojha, SS: Simran Singh, SW: Swati Sharma
 
