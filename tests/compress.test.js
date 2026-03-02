vi.mock('../lib/clients', () => ({
  openaiClient: null,
  arkClient: null,
  openrouterClient: null,
  getClientForModel: vi.fn(),
  resolveDefaultModel: vi.fn(() => 'gpt-4o'),
  formatProviderError: vi.fn(),
  DEFAULT_CONFIG: { model: 'gpt-4o', temperature: 1, presence_penalty: 0, frequency_penalty: 0 },
}));

const { sampleEvenly, prepareMessagesForCompress } = require('../routes/compress');

describe('sampleEvenly', () => {
  it('returns empty array for empty input', () => {
    expect(sampleEvenly([], 5)).toEqual([]);
  });

  it('returns empty array for null/undefined', () => {
    expect(sampleEvenly(null, 5)).toEqual([]);
    expect(sampleEvenly(undefined, 5)).toEqual([]);
  });

  it('returns all elements when array is shorter than count', () => {
    expect(sampleEvenly([1, 2, 3], 10)).toEqual([1, 2, 3]);
  });

  it('returns all elements when array length equals count', () => {
    expect(sampleEvenly([1, 2, 3], 3)).toEqual([1, 2, 3]);
  });

  it('samples evenly from larger array', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = sampleEvenly(arr, 3);
    expect(result).toHaveLength(3);
    // first and last should be included
    expect(result[0]).toBe(0);
    expect(result[result.length - 1]).toBe(9);
  });

  it('returns exactly count elements', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const result = sampleEvenly(arr, 10);
    expect(result).toHaveLength(10);
  });
});

describe('prepareMessagesForCompress', () => {
  it('extracts text from string content', () => {
    const messages = [
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'world' },
    ];
    const result = prepareMessagesForCompress(messages);
    expect(result).toContain('用户: hello');
    expect(result).toContain('AI: world');
  });

  it('skips pure image messages', () => {
    const messages = [
      { role: 'user', content: [{ type: 'image_url', image_url: { url: 'data:image/png;base64,AAA' } }] },
      { role: 'assistant', content: 'response' },
    ];
    const result = prepareMessagesForCompress(messages);
    expect(result).not.toContain('用户');
    expect(result).toContain('AI: response');
  });

  it('extracts text parts from multipart content', () => {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'look at this' },
          { type: 'image_url', image_url: { url: 'data:image/png;base64,AAA' } },
        ],
      },
    ];
    const result = prepareMessagesForCompress(messages);
    expect(result).toContain('用户: look at this');
  });

  it('truncates long messages', () => {
    const longText = '嗨'.repeat(500);
    const messages = [{ role: 'user', content: longText }];
    const result = prepareMessagesForCompress(messages);
    // Should be truncated to ~400 chars + "..."
    expect(result.length).toBeLessThan(longText.length + 20);
    expect(result).toContain('...');
  });

  it('respects total budget', () => {
    // Create many messages that exceed the budget
    const messages = Array.from({ length: 100 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'x'.repeat(300),
    }));
    const result = prepareMessagesForCompress(messages);
    // Total chars should not exceed 16000
    expect(Array.from(result).length).toBeLessThanOrEqual(16000 + 100); // small margin for role prefix
  });

  it('returns empty string for empty messages', () => {
    expect(prepareMessagesForCompress([])).toBe('');
  });
});
