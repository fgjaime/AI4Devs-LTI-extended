import en from '../locales/en.json';
import es from '../locales/es.json';

const getLeafEntries = (obj: Record<string, unknown>, prefix = ''): [string, unknown][] => {
  const entries: [string, unknown][] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...getLeafEntries(value as Record<string, unknown>, fullKey));
    } else {
      entries.push([fullKey, value]);
    }
  }
  return entries;
};

describe('Locale bundles', () => {
  const enEntries = getLeafEntries(en as unknown as Record<string, unknown>);
  const esEntries = getLeafEntries(es as unknown as Record<string, unknown>);
  const enKeys = enEntries.map(([k]) => k).sort();
  const esKeys = esEntries.map(([k]) => k).sort();

  it('en.json and es.json have identical key sets (1:1 parity)', () => {
    expect(enKeys).toEqual(esKeys);
  });

  it('no value in en.json is empty string or null', () => {
    for (const [key, value] of enEntries) {
      expect({ key, value }).not.toMatchObject({ value: '' });
      expect({ key, value }).not.toMatchObject({ value: null });
    }
  });

  it('no value in es.json is empty string or null', () => {
    for (const [key, value] of esEntries) {
      expect({ key, value }).not.toMatchObject({ value: '' });
      expect({ key, value }).not.toMatchObject({ value: null });
    }
  });

  it('no value in en.json contains "TODO" placeholder', () => {
    for (const [key, value] of enEntries) {
      if (typeof value === 'string') {
        expect({ key, value }).not.toMatchObject({ value: expect.stringContaining('TODO') });
      }
    }
  });

  it('no value in es.json contains "TODO" placeholder', () => {
    for (const [key, value] of esEntries) {
      if (typeof value === 'string') {
        expect({ key, value }).not.toMatchObject({ value: expect.stringContaining('TODO') });
      }
    }
  });
});
