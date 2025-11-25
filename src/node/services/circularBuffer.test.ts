import { describe, it, expect } from "bun:test";
import { CircularBuffer } from "./circularBuffer";

describe("CircularBuffer", () => {
  it("should store items up to capacity", () => {
    const buffer = new CircularBuffer<number>(3);
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);

    expect(buffer.length).toBe(3);
    expect(buffer.toArray()).toEqual([1, 2, 3]);
  });

  it("should overwrite oldest items when full", () => {
    const buffer = new CircularBuffer<number>(3);
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    buffer.push(4); // Should evict 1
    buffer.push(5); // Should evict 2

    expect(buffer.length).toBe(3);
    expect(buffer.toArray()).toEqual([3, 4, 5]);
  });

  it("should handle many overwrites efficiently", () => {
    const buffer = new CircularBuffer<number>(5);

    // Add 100 items, only last 5 should remain
    for (let i = 1; i <= 100; i++) {
      buffer.push(i);
    }

    expect(buffer.length).toBe(5);
    expect(buffer.toArray()).toEqual([96, 97, 98, 99, 100]);
  });

  it("should handle empty buffer", () => {
    const buffer = new CircularBuffer<string>(10);

    expect(buffer.length).toBe(0);
    expect(buffer.isEmpty()).toBe(true);
    expect(buffer.isFull()).toBe(false);
    expect(buffer.toArray()).toEqual([]);
  });

  it("should detect full state", () => {
    const buffer = new CircularBuffer<number>(2);

    expect(buffer.isFull()).toBe(false);
    buffer.push(1);
    expect(buffer.isFull()).toBe(false);
    buffer.push(2);
    expect(buffer.isFull()).toBe(true);
    buffer.push(3);
    expect(buffer.isFull()).toBe(true);
  });

  it("should clear all items", () => {
    const buffer = new CircularBuffer<number>(3);
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);

    buffer.clear();

    expect(buffer.length).toBe(0);
    expect(buffer.isEmpty()).toBe(true);
    expect(buffer.toArray()).toEqual([]);
  });

  it("should work with strings (real use case)", () => {
    const buffer = new CircularBuffer<string>(1000);

    // Simulate process output
    for (let i = 1; i <= 1500; i++) {
      buffer.push(`line ${i}`);
    }

    expect(buffer.length).toBe(1000);
    const lines = buffer.toArray();
    expect(lines[0]).toBe("line 501");
    expect(lines[999]).toBe("line 1500");
  });
});
