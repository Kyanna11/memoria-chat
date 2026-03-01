const { extractJsonFromLLM } = require('../routes/summarize');

describe('extractJsonFromLLM', () => {
  it('parses ```json code block', () => {
    const input = '这是一些前缀文字\n```json\n{"key": "value"}\n```\n后缀文字';
    expect(extractJsonFromLLM(input)).toEqual({ key: 'value' });
  });

  it('parses bare JSON object', () => {
    expect(extractJsonFromLLM('{"a": 1}')).toEqual({ a: 1 });
  });

  it('extracts JSON surrounded by text', () => {
    const input = '好的，以下是结果：\n{"mergedSystem": "hello"}\n希望对你有帮助。';
    expect(extractJsonFromLLM(input)).toEqual({ mergedSystem: 'hello' });
  });

  it('handles nested braces via progressive fallback', () => {
    const input = '结果 {"a": {"b": 1}} 多余的 } 字符';
    expect(extractJsonFromLLM(input)).toEqual({ a: { b: 1 } });
  });

  it('throws SyntaxError for input without JSON', () => {
    expect(() => extractJsonFromLLM('no json here')).toThrow(SyntaxError);
  });

  it('throws SyntaxError for empty string', () => {
    expect(() => extractJsonFromLLM('')).toThrow(SyntaxError);
  });

  it('prefers code block over bare JSON', () => {
    const input = '{"outside": true}\n```json\n{"inside": true}\n```';
    expect(extractJsonFromLLM(input)).toEqual({ inside: true });
  });

  it('handles multiline JSON in code block', () => {
    const input = '```json\n{\n  "newSystemFindings": "- 发现1\\n- 发现2",\n  "notes": "摘要"\n}\n```';
    const result = extractJsonFromLLM(input);
    expect(result.newSystemFindings).toBe('- 发现1\n- 发现2');
    expect(result.notes).toBe('摘要');
  });
});
