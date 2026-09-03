import { describe, expect, it } from "vitest";
import { formatElapsed } from "./execute-client";

describe("formatElapsed", () => {
  it("formats zero as 00:00", () => {
    expect(formatElapsed(0)).toBe("00:00");
  });

  it("pads single-digit minutes and seconds", () => {
    expect(formatElapsed(5_000)).toBe("00:05");
    expect(formatElapsed(65_000)).toBe("01:05");
  });

  it("rounds down partial seconds", () => {
    expect(formatElapsed(1_999)).toBe("00:01");
  });

  it("handles durations over an hour as minutes:seconds", () => {
    expect(formatElapsed(61 * 60_000)).toBe("61:00");
  });

  it("clamps negative durations to zero", () => {
    expect(formatElapsed(-500)).toBe("00:00");
  });
});
