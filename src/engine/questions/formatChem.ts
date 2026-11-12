/**
 * Chemical notation formatter.
 *
 *   H2SO4        → H₂SO₄          (digits after an element or bracket become subscripts)
 *   2H2 + O2     → 2H₂ + O₂       (leading coefficients stay normal size)
 *   Ca(OH)2      → Ca(OH)₂
 *   CuSO4.5H2O   → CuSO₄·5H₂O
 *   Fe^3+  SO4^2-  → Fe³⁺  SO₄²⁻  (`^` makes superscripts – charges, powers)
 *   Na+  Cl-     → Na⁺  Cl⁻        (bare trailing charge on a formula)
 *   10^-3        → 10⁻³
 *   ->  <-  <=>  → →  ←  ⇌
 *   cm3 dm3 dm-3 mol-1 s-1 → cm³ dm³ dm⁻³ mol⁻¹ s⁻¹
 *
 * Plain words are never touched, so it is safe to run on whole sentences.
 */

const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};
const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', 'n': 'ⁿ',
};

const toSub = (s: string) => s.replace(/[0-9]/g, (d) => SUB[d]);
const toSup = (s: string) => s.replace(/[0-9+\-−n]/g, (d) => SUP[d] ?? d);

/** One formula group: element symbols, brackets, digits, optional hydrate dot. */
const FORMULA_BODY = /^\d*(?:(?:[A-Z][a-z]?|[()[\]])\d*)+(?:[.·]\d*(?:(?:[A-Z][a-z]?|[()[\]])\d*)+)*$/;
const STATE = /\((?:aq|s|l|g)\)$/;
const UNIT = /^(?:(cm|dm|m|mol|s|g|kg|kJ|min)(-?\d)|(L|K|J)(-\d))$/;

function formatFormulaPart(part: string): string | null {
  let charge = '';
  let body = part;
  let state = '';
  const st = body.match(STATE);
  if (st) {
    state = st[0];
    body = body.slice(0, -state.length);
  }
  // Already-superscripted charge from the ^ pass (e.g. "SO4²⁻")
  const supTail = body.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]$/);
  if (supTail) {
    charge = supTail[0];
    body = body.slice(0, -charge.length);
  } else {
    const bare = body.match(/^(.*[A-Za-z)\]\d])([+-])$/);
    if (bare && /[A-Z]/.test(bare[1])) {
      body = bare[1];
      charge = toSup(bare[2]);
    }
  }
  if (!body || !FORMULA_BODY.test(body) || !/[A-Z]/.test(body)) return null;
  // A lone capital with no digits/charge (e.g. "A", "I") – leave alone.
  if (/^[A-Z][a-z]?$/.test(body) && !charge) return part;
  const lead = body.match(/^\d*/)![0];
  let rest = body.slice(lead.length);
  // subscript digits that follow an element symbol or closing bracket
  rest = rest.replace(/([A-Za-z)\]])(\d+)/g, (_, a: string, d: string) => a + toSub(d));
  // hydrate dot: CuSO4.5H2O
  rest = rest.replace(/[.](\d*)/g, '·$1');
  return lead + rest + charge + state;
}

function formatToken(token: string): string {
  // Peel off leading/trailing punctuation that is not part of the formula.
  const m = token.match(/^([“"'‘]*)(.*?)([,;:!?"'”’]*\.?)$/);
  if (!m) return token;
  const [, pre, core0, post0] = m;
  let core = core0;
  let post = post0;
  // A trailing full stop could be sentence punctuation; formulas never end in "."
  if (core.endsWith('.')) {
    core = core.slice(0, -1);
    post = '.' + post;
  }
  if (!core) return token;

  const unit = core.match(UNIT);
  if (unit) return pre + (unit[1] ?? unit[3]) + toSup(unit[2] ?? unit[4]) + post;

  // Structural formulas joined by bonds: CH3-CH2-OH, CH2=CH2
  if (/[A-Z]/.test(core) && /[-=≡]/.test(core.slice(1, -1))) {
    const parts = core.split(/([-=≡])/);
    const out = parts.map((p, i) => (i % 2 ? p : formatFormulaPart(p)));
    if (out.every((p) => p !== null)) return pre + out.join('') + post;
  }
  const f = formatFormulaPart(core);
  return f === null ? token : pre + f + post;
}

export function formatChem(input: string): string {
  if (!input) return input;
  let s = input
    .replace(/<=>|<->|⇌/g, '⇌')
    .replace(/-->|->/g, '→')
    .replace(/<--|<-/g, '←');
  // ^ superscripts: x^2, 10^-3, Fe^3+, SO4^2-, e^-
  s = s.replace(/\^\{([^}]*)\}|\^([+\-−]?\d*[+\-−]?n?)/g, (_, braced: string, plain: string) =>
    toSup(braced ?? plain),
  );
  return s
    .split(/(\s+)/)
    .map((tok, i) => (i % 2 ? tok : formatToken(tok)))
    .join('');
}

/** Reverse of the formatter – used to compare typed answers fairly. */
export function plainChem(s: string): string {
  const back: Record<string, string> = {};
  for (const [k, v] of Object.entries(SUB)) back[v] = k;
  for (const [k, v] of Object.entries(SUP)) back[v] = k === '−' ? '-' : k;
  return s
    .replace(/[₀-₉⁰¹²³⁴-⁹⁺⁻ⁿ]/g, (c) => back[c] ?? c)
    .replace(/·/g, '.')
    .replace(/→/g, '->')
    .replace(/⇌/g, '<=>')
    .replace(/←/g, '<-')
    .replace(/[−–—]/g, '-');
}
