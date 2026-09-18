import { describe, it, expect } from "vitest";
import { markdownToHtml, parseFrontmatter } from "./markdown";

describe("parseFrontmatter", () => {
  it("parses frontmatter fields and body", () => {
    const source = `---
title: "My Title"
description: "A description"
date: "2026-09-18"
slug: "my-slug"
---
Hello world`;
    const { frontmatter, body } = parseFrontmatter(source);
    expect(frontmatter.title).toBe("My Title");
    expect(frontmatter.slug).toBe("my-slug");
    expect(body).toBe("Hello world");
  });

  it("throws when required fields are missing", () => {
    expect(() => parseFrontmatter("---\ntitle: x\n---\nbody")).toThrow(/missing required field/);
  });

  it("throws when frontmatter block is missing", () => {
    expect(() => parseFrontmatter("no frontmatter here")).toThrow(/missing frontmatter/);
  });
});

describe("markdownToHtml", () => {
  it("renders headings, paragraphs, bold, links, and lists", () => {
    const html = markdownToHtml(`## Sub heading

A **bold** move with a [link](https://example.com).

- one
- two

1. first
2. second

> quoted text

Some \`inline code\` here.`);
    expect(html).toContain("<h3>Sub heading</h3>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain('<a href="https://example.com">link</a>');
    expect(html).toContain("<ul>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<code>inline code</code>");
  });

  it("renders code fences and escapes HTML", () => {
    const html = markdownToHtml("```js\nconst a = 1 < 2;\n```");
    expect(html).toContain("<pre><code");
    expect(html).toContain("1 &lt; 2");
    const escaped = markdownToHtml("<script>alert(1)</script>");
    expect(escaped).toContain("&lt;script&gt;");
    expect(escaped).not.toContain("<script>");
  });
});
