import { describe, expect, it } from 'vitest';
import { buildBankPrompt } from './bankPrompt';

describe('buildBankPrompt', () => {
  it('includes topic, count, types and a JSON example', () => {
    const p = buildBankPrompt({ topic: 'rates', subtopic: 'Catalysis', count: 12, difficulty: 'mixed', types: ['mcq', 'numeric'], bankId: 'rates-cat', bankName: 'Catalysis', notes: '', language: 'en' });
    expect(p).toContain('Rates of reaction');
    expect(p).toContain('Write 12 original');
    expect(p).toContain('"numeric" – calculation');
    expect(p).not.toContain('"match" – match pairs');
    expect(p).toContain('```json');
    expect(p).toContain('"bankId": "rates-cat"');
    expect(p).not.toContain('IRISH');
  });

  it('asks for Irish when requested', () => {
    const p = buildBankPrompt({ topic: 'organic', subtopic: '', count: 5, difficulty: '1', types: ['mcq'], bankId: 'org-ga', bankName: 'Orgánach', notes: '', language: 'ga' });
    expect(p).toContain('IRISH (Gaeilge)');
    expect(p).toContain('Ceimic orgánach');
    expect(p).toContain('"language": "ga"');
  });
});
