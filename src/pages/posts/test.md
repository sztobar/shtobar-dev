---
layout: "../../layouts/BlogPost.astro"
title: Test Post
description: This is a test post to check every possible markdown node
pubDate: '2020-01-01'
tag: gamedev
draft: true
---

This article should not appear in built blog, it's only usable during the develoment

# H1

## H2

### H3

**bold text**

_italicized text_

> blockquote

1. First item
2. Second item
3. Third item

- First item
- Second item
- Third item

`code`

```tsx
interface Box<T> {
    value: T;
}

function makeBox<T>(value: T) {
    return { value };
}

const Component = () => (
  <div>{lala}</div>
)
```

---

[title](https://www.example.com)

![alt text](image.jpg)

![alt text](/images/bg-dark.jpg)
