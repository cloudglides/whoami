import { describe, expect, it } from "bun:test";

describe("email provider selection", () => {
  it("selects mailpit provider by default", async () => {
    process.env.EMAIL_PROVIDER = "mailpit";
    const { getProvider } = await import("./send");
    expect(getProvider().name).toBe("mailpit");
  });
  it("throws on unknown provider", async () => {
    process.env.EMAIL_PROVIDER = "carrier-pigeon";
    const { getProvider } = await import("./send");
    expect(() => getProvider()).toThrow("Unknown EMAIL_PROVIDER");
  });
});
