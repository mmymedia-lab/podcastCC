import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkAiRateLimit } from "./ai-rate-limit";

describe("checkAiRateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit for a given user", () => {
    const userId = `user-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      expect(checkAiRateLimit(userId)).toBe(true);
    }
  });

  it("blocks the 11th request within the same window", () => {
    const userId = `user-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      checkAiRateLimit(userId);
    }
    expect(checkAiRateLimit(userId)).toBe(false);
  });

  it("tracks each user independently", () => {
    const userA = `user-a-${Math.random()}`;
    const userB = `user-b-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      checkAiRateLimit(userA);
    }
    expect(checkAiRateLimit(userA)).toBe(false);
    expect(checkAiRateLimit(userB)).toBe(true);
  });

  it("allows requests again once the window has passed", () => {
    vi.useFakeTimers();
    const userId = `user-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      checkAiRateLimit(userId);
    }
    expect(checkAiRateLimit(userId)).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(checkAiRateLimit(userId)).toBe(true);
    vi.useRealTimers();
  });
});
