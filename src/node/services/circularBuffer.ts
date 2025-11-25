/**
 * Efficient circular buffer with fixed capacity
 * Avoids O(n) array operations when evicting old items
 */
export class CircularBuffer<T> {
  private buffer: T[];
  private head = 0; // Index of oldest item
  private tail = 0; // Index where next item will be written
  private size = 0; // Current number of items

  constructor(private readonly capacity: number) {
    this.buffer = new Array<T>(capacity);
  }

  /**
   * Add an item to the buffer
   * If buffer is full, oldest item is overwritten
   */
  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.size < this.capacity) {
      this.size++;
    } else {
      // Buffer is full, head moves forward (oldest item overwritten)
      this.head = (this.head + 1) % this.capacity;
    }
  }

  /**
   * Get all items in order (oldest to newest)
   */
  toArray(): T[] {
    if (this.size === 0) {
      return [];
    }

    const result: T[] = [];
    let idx = this.head;
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[idx]);
      idx = (idx + 1) % this.capacity;
    }
    return result;
  }

  /**
   * Get number of items currently stored
   */
  get length(): number {
    return this.size;
  }

  /**
   * Check if buffer is empty
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Check if buffer is at capacity
   */
  isFull(): boolean {
    return this.size === this.capacity;
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
}
