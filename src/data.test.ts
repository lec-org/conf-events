import { describe, expect, it } from "vite-plus/test";
import { eventCategories, events } from "./data.ts";

describe("event data", () => {
  it("keeps every event in a known category", () => {
    for (const event of events) {
      expect(eventCategories).toContain(event.category);
    }
  });

  it("uses stable ascending date strings", () => {
    for (const event of events) {
      expect(event.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (event.end) {
        expect(event.end >= event.start).toBe(true);
      }
    }
  });
});
