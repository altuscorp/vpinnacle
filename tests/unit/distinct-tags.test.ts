import { describe, it, expect } from "vitest";
import { dedupTags } from "@/lib/queries/distinct-tags";

describe("dedupTags", () => {
  it("flattens, lowercases, and dedups", () => {
    expect(
      dedupTags([
        { tags: ["KYC", "loan"] },
        { tags: ["kyc", "Audit"] },
        { tags: null },
        { tags: ["LOAN", "audit"] },
      ]),
    ).toEqual(["Audit", "KYC", "loan"]);
  });

  it("returns empty for empty input", () => {
    expect(dedupTags([])).toEqual([]);
  });

  it("preserves original casing of first occurrence (for display)", () => {
    expect(
      dedupTags([
        { tags: ["GST", "tds"] },
        { tags: ["gst", "TDS"] },
      ]),
    ).toEqual(["GST", "tds"]);
  });
});
