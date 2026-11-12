import { describe, expect, it } from 'vitest';
import { formatChem, plainChem } from './formatChem';

describe('formatChem', () => {
  it.each([
    ['H2SO4', 'H₂SO₄'],
    ['2H2 + O2 -> 2H2O', '2H₂ + O₂ → 2H₂O'],
    ['Ca(OH)2', 'Ca(OH)₂'],
    ['CuSO4.5H2O', 'CuSO₄·5H₂O'],
    ['Fe^3+ and SO4^2-', 'Fe³⁺ and SO₄²⁻'],
    ['Na+ and Cl-', 'Na⁺ and Cl⁻'],
    ['N2 + 3H2 <=> 2NH3', 'N₂ + 3H₂ ⇌ 2NH₃'],
    ['6.0 x 10^23 mol-1', '6.0 x 10²³ mol⁻¹'],
    ['25 cm3 of 0.1 mol dm-3 HCl', '25 cm³ of 0.1 mol dm⁻³ HCl'],
    ['CH3-CH2-OH', 'CH₃-CH₂-OH'],
    ['NaCl(aq)', 'NaCl(aq)'],
    ['H2O(l).', 'H₂O(l).'],
    ['(CO2)', '(CO₂)'],
  ])('%s → %s', (input, out) => {
    expect(formatChem(input)).toBe(out);
  });

  it('leaves ordinary words alone', () => {
    const s = 'Which of the following is a primary standard? I think A is.';
    expect(formatChem(s)).toBe(s);
  });

  it('plainChem reverses formatting', () => {
    expect(plainChem('H₂SO₄ → Fe³⁺')).toBe('H2SO4 -> Fe3+');
  });
});
