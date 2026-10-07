import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "./markdown";

const render = (md: string) => renderToStaticMarkup(<Markdown>{md}</Markdown>);

describe("Markdown", () => {
  it("renders GitHub-flavoured markdown", () => {
    const html = render("- **one**\n- two");
    expect(html).toContain("<strong>one</strong>");
    expect(html).toContain("<li>two</li>");
  });

  it("drops raw HTML instead of rendering it", () => {
    const html = render('Hello <script>alert(1)</script><img src=x onerror="alert(1)">');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
  });

  it("neutralises javascript: links", () => {
    const html = render("[click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });

  it("opens external links safely", () => {
    const html = render("[site](https://example.com)");
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders nothing for empty content", () => {
    expect(render("   ")).toBe("");
  });
});
