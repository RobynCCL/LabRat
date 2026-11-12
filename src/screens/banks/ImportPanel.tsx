import { useState } from 'react';
import { topics } from '@/content/topics';
import template from '@/content/banks/_template.json';
import { parseCsvBank, questionsToCsv } from '@/engine/questions/csv';
import { parseJsonLoose, slugify, validateBank, type ValidationResult } from '@/engine/questions/validate';
import type { QuestionBank } from '@/engine/questions/types';
import { useGame } from '@/store/game';
import { allBanks } from '@/lib/questionPool';
import { downloadText } from '@/lib/exportPng';
import { toast } from '@/lib/events';
import { play } from '@/lib/sound';
import { Button, Card, Icon, Segmented } from '@/components/ui';

type Mode = 'merge' | 'replace' | 'copy';

export function ImportPanel({ onDone, initialText = '' }: { onDone: (bankId: string) => void; initialText?: string }) {
  const save = useGame((g) => g.save);
  const { upsertBank } = useGame.getState();
  const [source, setSource] = useState<'paste' | 'file'>('paste');
  const [text, setText] = useState(initialText);
  const [csvName, setCsvName] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [parseError, setParseError] = useState('');
  const [mode, setMode] = useState<Mode>('merge');
  const [showWarnings, setShowWarnings] = useState(false);

  const existing = result?.bank ? allBanks(save.banks.user, []).find((e) => e.bank.bankId === result.bank!.bankId) : undefined;

  const check = (content: string, kind: 'json' | 'csv', name = '') => {
    setParseError('');
    setResult(null);
    if (!content.trim()) {
      setParseError('Nothing to import yet. Paste JSON or choose a file.');
      return;
    }
    if (kind === 'csv') {
      const bankName = csvName.trim() || name.replace(/\.csv$/i, '') || 'Imported CSV bank';
      setResult(parseCsvBank(content, { name: bankName, bankId: slugify(bankName) }, topics));
      return;
    }
    try {
      setResult(validateBank(parseJsonLoose(content), topics));
    } catch (e) {
      setParseError(`That isn't valid JSON: ${(e as Error).message}. Check for missing commas, quotes or brackets.`);
    }
  };

  const onFile = async (f: File) => {
    setFileName(f.name);
    const content = await f.text();
    check(content, /\.csv$/i.test(f.name) || f.type === 'text/csv' ? 'csv' : 'json', f.name);
  };

  const doImport = () => {
    if (!result?.bank) return;
    let bank: QuestionBank = result.bank;
    const prev = save.banks.user.find((b) => b.bankId === bank.bankId);
    if (existing) {
      if (mode === 'copy') {
        let n = 2;
        while (allBanks(save.banks.user, []).some((e) => e.bank.bankId === `${bank.bankId}-${n}`)) n++;
        bank = { ...bank, bankId: `${bank.bankId}-${n}`, name: `${bank.name} (${n})` };
      } else if (mode === 'merge') {
        const base = prev ?? existing.bank;
        const byId = new Map(base.questions.map((q) => [q.id, q]));
        for (const q of bank.questions) byId.set(q.id, q);
        bank = { ...base, version: Math.max(base.version, bank.version), questions: [...byId.values()], sample: base.sample };
      }
    }
    upsertBank(bank);
    play('buy');
    toast(`Imported ${result.validCount} question${result.validCount === 1 ? '' : 's'} into “${bank.name}”`, 'good');
    setResult(null);
    setText('');
    onDone(bank.bankId);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <Card className="p-5">
        <Segmented label="Import source" value={source} onChange={setSource} options={[{ value: 'paste', label: 'Paste JSON' }, { value: 'file', label: 'Upload file (.json / .csv)' }]} />
        {source === 'paste' ? (
          <div className="mt-4">
            <label className="label" htmlFor="paste">
              Paste a bank (or a list of questions). Text around a ```json block is ignored.
            </label>
            <textarea id="paste" className="input min-h-[14rem] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder='{"bankId": "…", "name": "…", "version": 1, "questions": [ … ]}' spellCheck={false} />
            <Button className="mt-3" icon="check" onClick={() => check(text, 'json')}>
              Check
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50">
              <Icon name="upload" size={28} className="text-muted" />
              <span className="font-semibold">{fileName || 'Choose a .json or .csv file'}</span>
              <span className="text-xs text-muted">CSV columns: id, topic, subtopic, type, difficulty, question, options, answer, explanation, tags, tolerance, unit, caseSensitive</span>
              <input
                type="file"
                accept=".json,.csv,application/json,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                  e.target.value = '';
                }}
              />
            </label>
            <div>
              <label className="label" htmlFor="csvname">
                Bank name for CSV files (optional)
              </label>
              <input id="csvname" className="input" value={csvName} onChange={(e) => setCsvName(e.target.value)} placeholder="e.g. Organic – reaction types" />
            </div>
          </div>
        )}

        {parseError && (
          <p className="mt-4 rounded-xl bg-bad/10 p-3 text-sm font-semibold text-bad" role="alert">
            {parseError}
          </p>
        )}

        {result && (
          <div className="mt-5 grid gap-3" role="status">
            {result.bank ? (
              <div className={`flex items-start gap-3 rounded-xl p-3 ${result.errors.length ? 'bg-warn/10' : 'bg-good/10'}`}>
                <Icon name={result.errors.length ? 'info' : 'check'} className={result.errors.length ? 'text-warn' : 'text-good'} />
                <div>
                  <div className="font-semibold">
                    “{result.bank.name}” · {result.validCount} valid question{result.validCount === 1 ? '' : 's'}
                    {result.invalidCount > 0 && <span className="text-bad">, {result.invalidCount} with problems (will be skipped)</span>}
                  </div>
                  <div className="text-sm text-muted">bankId: {result.bank.bankId}</div>
                </div>
              </div>
            ) : null}
            {result.errors.length > 0 && (
              <div className="max-h-64 overflow-auto rounded-xl border border-bad/30">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-surface-2 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Field</th>
                      <th className="px-3 py-2">Problem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, i) => (
                      <tr key={i} className="border-t border-border align-top">
                        <td className="px-3 py-1.5 num">{e.row ?? '–'}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{e.id ?? ''}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{e.field ?? ''}</td>
                        <td className="px-3 py-1.5 text-bad">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {result.warnings.length > 0 && (
              <div>
                <button className="text-sm font-semibold text-muted underline" onClick={() => setShowWarnings(!showWarnings)}>
                  {showWarnings ? 'Hide' : 'Show'} {result.warnings.length} warning{result.warnings.length === 1 ? '' : 's'}
                </button>
                {showWarnings && (
                  <ul className="mt-1 list-disc pl-6 text-sm text-muted">
                    {result.warnings.map((w, i) => (
                      <li key={i}>
                        {w.row != null && `Row ${w.row}: `}
                        {w.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {result.bank && result.validCount > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {existing && (
                  <div className="w-full">
                    <p className="mb-1 text-sm">
                      A bank with id <b>{result.bank.bankId}</b> already exists ({existing.bank.questions.length} questions{existing.builtIn ? ', built-in' : ''}).
                    </p>
                    <Segmented
                      size="sm"
                      label="Existing bank"
                      value={mode}
                      onChange={setMode}
                      options={[
                        { value: 'merge', label: 'Merge (update same ids)' },
                        { value: 'replace', label: 'Replace' },
                        { value: 'copy', label: 'Import as a copy' },
                      ]}
                    />
                  </div>
                )}
                <Button icon="download" onClick={doImport}>
                  Import {result.validCount} question{result.validCount === 1 ? '' : 's'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="h-fit p-5">
        <h3 className="font-semibold">Templates</h3>
        <p className="mt-1 text-sm text-muted">Start from a template with one example of every question type.</p>
        <div className="mt-3 grid gap-2">
          <Button variant="secondary" size="sm" icon="download" onClick={() => downloadText(JSON.stringify(template, null, 2), 'lab-rat-bank-template.json')}>
            JSON template
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon="download"
            onClick={() => {
              const r = validateBank(template, topics);
              downloadText(questionsToCsv(r.bank!.questions), 'lab-rat-bank-template.csv', 'text/csv');
            }}
          >
            CSV template
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted">Topic ids: {topics.map((t) => t.id).join(', ')}</p>
      </Card>
    </div>
  );
}
