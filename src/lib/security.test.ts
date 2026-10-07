import { describe, expect, it } from "vitest";
import { safeEqual, sign, unsign } from "./crypto";
import { checkFormToken, issueFormToken } from "./form-token";
import { briefSchema, projectSchema, settingsSchema } from "./validation";

describe("sign / unsign", () => {
  it("round-trips a value signed with the same secret", () => {
    expect(unsign("s".repeat(32), sign("s".repeat(32), "hello"))).toBe("hello");
  });

  it("rejects tampering and other secrets", () => {
    const token = sign("a".repeat(32), "brief:123");
    expect(unsign("a".repeat(32), token.replace("123", "999"))).toBeNull();
    expect(unsign("b".repeat(32), token)).toBeNull();
    expect(unsign("a".repeat(32), "no-signature")).toBeNull();
  });

  it("compares in constant shape regardless of length", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("brief form token", () => {
  const issued = 1_000_000;
  const token = issueFormToken(issued);

  it("accepts a token a few seconds old", () => {
    expect(checkFormToken(token, issued + 10_000)).toBe("ok");
  });

  it("flags instant submissions as bot-like", () => {
    expect(checkFormToken(token, issued + 500)).toBe("too-fast");
  });

  it("expires after two hours", () => {
    expect(checkFormToken(token, issued + 3 * 60 * 60 * 1000)).toBe("expired");
  });

  it("rejects forged tokens", () => {
    expect(checkFormToken(`brief:${issued}.deadbeef`, issued + 10_000)).toBe("invalid");
    expect(checkFormToken("", issued)).toBe("invalid");
  });
});

describe("briefSchema", () => {
  const valid = {
    engagements: ["audit"],
    currentState: "A live product",
    message: "We need an outside review of our Laravel API before launch.",
    timeline: "",
    budget: "",
    name: "Sam",
    email: "sam@example.com",
    company: "",
  };

  it("accepts a reasonable brief", () => {
    expect(briefSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short messages, bad emails and unknown engagement types", () => {
    expect(briefSchema.safeParse({ ...valid, message: "help" }).success).toBe(false);
    expect(briefSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(briefSchema.safeParse({ ...valid, engagements: ["hack-my-ex"] }).success).toBe(false);
    expect(briefSchema.safeParse({ ...valid, timeline: "yesterday" }).success).toBe(false);
  });
});

describe("projectSchema / settingsSchema", () => {
  it("rejects javascript: URLs in links and evidence", () => {
    const base = projectSchema.shape;
    expect(base.links.safeParse([{ label: "x", url: "javascript:alert(1)", kind: "live" }]).success).toBe(false);
    expect(base.evidence.safeParse([{ kind: "link", url: "javascript:alert(1)", caption: "" }]).success).toBe(false);
    expect(base.links.safeParse([{ label: "Repo", url: "https://github.com/x/y", kind: "repo" }]).success).toBe(true);
  });

  it("only allows safe slugs", () => {
    expect(projectSchema.shape.slug.safeParse("vaakku-ai").success).toBe(true);
    expect(projectSchema.shape.slug.safeParse("../admin").success).toBe(false);
    expect(projectSchema.shape.slug.safeParse("Has Spaces").success).toBe(false);
  });

  it("keeps contact URLs to http(s)", () => {
    expect(settingsSchema.shape.linkedin.safeParse("https://www.linkedin.com/in/x").success).toBe(true);
    expect(settingsSchema.shape.linkedin.safeParse("data:text/html,hi").success).toBe(false);
    expect(settingsSchema.shape.whatsapp.safeParse("+91 98765 43210").success).toBe(true);
    expect(settingsSchema.shape.whatsapp.safeParse("<script>").success).toBe(false);
  });
});
