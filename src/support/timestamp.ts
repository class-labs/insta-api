const startTime = Date.parse('2000-01-01T00:00:00.000Z');

// This returns the number of seconds since startTime encoded as base64
export function createTimestamp() {
  return Math.floor((Date.now() - startTime) / 1000).toString(36);
}
