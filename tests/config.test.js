vi.mock('../lib/clients', () => ({
  openaiClient: null,
  arkClient: null,
  openrouterClient: null,
  getClientForModel: vi.fn(),
  resolveDefaultModel: vi.fn(() => 'gpt-4o'),
  formatProviderError: vi.fn(),
  DEFAULT_CONFIG: { model: 'gpt-4o', temperature: 1, presence_penalty: 0, frequency_penalty: 0 },
}));

const { isPlainObject, clampNumber, normalizeConfig, getConversationPath, atomicWrite, createMutex } = require('../lib/config');
const os = require('os');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

const DEFAULT_CONFIG = {
  model: 'gpt-4o',
  temperature: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
};

describe('isPlainObject', () => {
  it('{} -> true', () => {
    expect(isPlainObject({})).toBe(true);
  });

  it('[] -> false', () => {
    expect(isPlainObject([])).toBe(false);
  });

  it('null -> false', () => {
    expect(isPlainObject(null)).toBe(false);
  });

  it('undefined -> false', () => {
    expect(isPlainObject(undefined)).toBe(false);
  });

  it('"string" -> false', () => {
    expect(isPlainObject('string')).toBe(false);
  });

  it('123 -> false', () => {
    expect(isPlainObject(123)).toBe(false);
  });

  it('new Date() -> false', () => {
    expect(isPlainObject(new Date())).toBe(false);
  });
});

describe('clampNumber', () => {
  it('returns value when in range', () => {
    expect(clampNumber(5, 0, 10, 0)).toBe(5);
  });

  it('returns max when exceeds upper bound', () => {
    expect(clampNumber(11, 0, 10, 0)).toBe(10);
  });

  it('returns min when below lower bound', () => {
    expect(clampNumber(-1, 0, 10, 0)).toBe(0);
  });

  it('returns fallback for undefined', () => {
    expect(clampNumber(undefined, 0, 10, 7)).toBe(7);
  });

  it('returns fallback for NaN', () => {
    expect(clampNumber(NaN, 0, 10, 7)).toBe(7);
  });

  it('returns fallback for non-number', () => {
    expect(clampNumber('5', 0, 10, 7)).toBe(7);
  });

  it('returns value at boundary (min and max)', () => {
    expect(clampNumber(0, 0, 10, 7)).toBe(0);
    expect(clampNumber(10, 0, 10, 7)).toBe(10);
  });
});

describe('normalizeConfig', () => {
  it('returns DEFAULT_CONFIG values for empty object', () => {
    expect(normalizeConfig({})).toEqual({
      ...DEFAULT_CONFIG,
      context_window: 50,
      auto_compress: false,
      compress_keep_recent: 10,
    });
  });

  it('preserves valid complete config', () => {
    const input = {
      model: 'gpt-4o-mini',
      temperature: 1.5,
      presence_penalty: 1,
      frequency_penalty: -1,
      context_window: 120,
      top_p: 0.8,
    };
    expect(normalizeConfig(input)).toEqual({
      ...input,
      auto_compress: false,
      compress_keep_recent: 10,
    });
  });

  it('falls back to default model for empty string', () => {
    expect(normalizeConfig({ model: '' }).model).toBe(DEFAULT_CONFIG.model);
  });

  it('falls back to default model for whitespace-only string', () => {
    expect(normalizeConfig({ model: '   ' }).model).toBe(DEFAULT_CONFIG.model);
  });

  it('trims model string', () => {
    expect(normalizeConfig({ model: '  gpt-4o-mini  ' }).model).toBe('gpt-4o-mini');
  });

  it('clamps temperature to [0, 2]', () => {
    expect(normalizeConfig({ temperature: 3 }).temperature).toBe(2);
    expect(normalizeConfig({ temperature: -1 }).temperature).toBe(0);
  });

  it('excludes top_p when undefined', () => {
    const result = normalizeConfig({ top_p: undefined });
    expect('top_p' in result).toBe(false);
  });

  it('includes top_p when valid', () => {
    const result = normalizeConfig({ top_p: 0.6 });
    expect(result.top_p).toBe(0.6);
  });

  it('defaults context_window to 50', () => {
    expect(normalizeConfig({}).context_window).toBe(50);
  });
});

describe('getConversationPath', () => {
  it('returns path for 10-digit id', () => {
    const result = getConversationPath('1234567890');
    expect(typeof result).toBe('string');
    expect(result).toMatch(/1234567890\.json$/);
  });

  it('returns path for 16-digit id', () => {
    const result = getConversationPath('1234567890123456');
    expect(typeof result).toBe('string');
    expect(result).toMatch(/1234567890123456\.json$/);
  });

  it('returns null for 9-digit id', () => {
    expect(getConversationPath('123456789')).toBeNull();
  });

  it('returns null for 17-digit id', () => {
    expect(getConversationPath('12345678901234567')).toBeNull();
  });

  it('returns null for id with letters', () => {
    expect(getConversationPath('12345abcde')).toBeNull();
  });

  it('returns null for null or undefined', () => {
    expect(getConversationPath(null)).toBeNull();
    expect(getConversationPath(undefined)).toBeNull();
  });
});

describe('atomicWrite', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'atomicwrite-'));
  });

  afterEach(async () => {
    await fsp.rm(tmpDir, { recursive: true, force: true });
  });

  it('writes content and reads back correctly', async () => {
    const filePath = path.join(tmpDir, 'test.json');
    await atomicWrite(filePath, '{"hello":"world"}');
    const content = await fsp.readFile(filePath, 'utf-8');
    expect(content).toBe('{"hello":"world"}');
  });

  it('leaves no .tmp files after write', async () => {
    const filePath = path.join(tmpDir, 'test.json');
    await atomicWrite(filePath, 'data');
    const files = await fsp.readdir(tmpDir);
    const tmpFiles = files.filter(f => f.endsWith('.tmp'));
    expect(tmpFiles).toHaveLength(0);
  });

  it('overwrites existing file completely', async () => {
    const filePath = path.join(tmpDir, 'test.json');
    await atomicWrite(filePath, 'original content');
    await atomicWrite(filePath, 'new content');
    const content = await fsp.readFile(filePath, 'utf-8');
    expect(content).toBe('new content');
  });
});

describe('createMutex', () => {
  it('serializes async tasks in FIFO order', async () => {
    const withLock = createMutex();
    const order = [];

    const p1 = withLock(async () => {
      await new Promise(r => setTimeout(r, 50));
      order.push('first');
    });
    const p2 = withLock(async () => {
      order.push('second');
    });

    await Promise.all([p1, p2]);
    expect(order).toEqual(['first', 'second']);
  });

  it('does not deadlock when first task throws', async () => {
    const withLock = createMutex();
    const order = [];

    const p1 = withLock(async () => {
      order.push('first');
      throw new Error('boom');
    }).catch(() => {});

    const p2 = withLock(async () => {
      order.push('second');
    });

    await Promise.all([p1, p2]);
    expect(order).toEqual(['first', 'second']);
  });

  it('passes through return value', async () => {
    const withLock = createMutex();
    const result = await withLock(() => 42);
    expect(result).toBe(42);
  });
});
