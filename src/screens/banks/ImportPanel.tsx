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
import { useI18n } from '@/i18n/useI18n';
import { formatIssue } from '@/i18n';

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
  const { t, lang } = useI18n();
  const [importLang, setImportLang] = useState<'en' | 'ga'>(lang);

  const existing = result?.bank ? allBanks(save.banks.user, []).find((e) => e.bank.bankId === result.bank!.bankId) : undefined;

  const check = (content: string, kind: 'json' | 'csv', name = '') => {
    setParseError('');
    setResult(null);
    if (!content.trim()) {
      setParseError(t.import.nothing);
      return;
    }
    if (kind === 'csv') {
      const bankName = csvName.trim() || name.replace(/\.csv$/i, '') || t.import.defaultCsvName;
      setResult(parseCsvBank(content, { name: bankName, bankId: slugify(bankName), language: importLang }, topics));
      return;
    }
    try {
      setResult(validateBank(parseJsonLoose(content), topics));
    } catch (e) {
      setParseError(t.import.invalidJson((e as Error).message));
    }
  };

  const onFile = async (f: File) => {
    setFileName(f.name);
    const content = await f.text();
    check(content, /\.csv$/i.test(f.name) || f.type === 'text/csv' ? 'csv' : 'json', f.name);
  };

  const doImport = () => {
    if (!result?.bank) return;
    let bank: QuestionBank = { ...result.bank, language: result.bank.language ?? importLang };
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
    toast(t.import.imported(result.validCount, bank.name), 'good');
    setResult(null);
    setText('');
    onDone(bank.bankId);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <Card className="p-5">
        <Segmented label={t.import.source} value={source} onChange={setSource} options={[{ value: 'paste', label: t.import.paste }, { value: 'file', label: t.import.upload }]} />
        <label className="mt-4 block max-w-sm">
          <span className="label">{t.import.language}</span>
          <select className="input" value={importLang} onChange={(e) => setImportLang(e.target.value as 'en' | 'ga')}>
            <option value="en">{t.common.languageNames.en}</option>
            <option value="ga">{t.common.languageNames.ga}</option>
          </select>
        </label>
        {source === 'paste' ? (
          <div className="mt-4">
            <label className="label" htmlFor="paste">
              {t.import.pasteLabel}
            </label>
            <textarea id="paste" className="input min-h-[14rem] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder='{"bankId": "…", "name": "…", "version": 1, "questions": [ … ]}' spellCheck={false} />
            <Button className="mt-3" icon="check" onClick={() => check(text, 'json')}>
              {t.import.check}
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50">
              <Icon name="upload" size={28} className="text-muted" />
              <span className="font-semibold">{fileName || t.import.chooseFile}</span>
              <span className="text-xs text-muted">{t.import.csvColumns}</span>
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
                {t.import.csvName}
              </label>
              <input id="csvname" className="input" value={csvName} onChange={(e) => setCsvName(e.target.value)} placeholder={t.import.csvNamePlaceholder} />
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
                    {t.import.valid(result.bank.name, result.validCount)}
                    {result.invalidCount > 0 && <span className="text-bad">{t.import.problems(result.invalidCount)}</span>}
                  </div>
                  <div className="text-sm text-muted">
                    {t.import.bankId} {result.bank.bankId} · {t.common.languageNames[result.bank.language ?? importLang]}
                  </div>
                </div>
              </div>
            ) : null}
            {result.errors.length > 0 && (
              <div className="max-h-64 overflow-auto rounded-xl border border-bad/30">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-surface-2 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-3 py-2">{t.import.row}</th>
                      <th className="px-3 py-2">{t.import.id}</th>
                      <th className="px-3 py-2">{t.import.field}</th>
                      <th className="px-3 py-2">{t.import.problem}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, i) => (
                      <tr key={i} className="border-t border-border align-top">
                        <td className="px-3 py-1.5 num">{e.row ?? '–'}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{e.id ?? ''}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{e.field ?? ''}</td>
                        <td className="px-3 py-1.5 text-bad">{formatIssue(t, e)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {result.warnings.length > 0 && (
              <div>
                <button className="text-sm font-semibold text-muted underline" onClick={() => setShowWarnings(!showWarnings)}>
                  {t.import.warnings(showWarnings, result.warnings.length)}
                </button>
                {showWarnings && (
                  <ul className="mt-1 list-disc pl-6 text-sm text-muted">
                    {result.warnings.map((w, i) => (
                      <li key={i}>
                        {w.row != null && t.import.rowN(w.row)}
                        {formatIssue(t, w)}
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
                      {t.import.exists(result.bank.bankId, existing.bank.questions.length, existing.builtIn)}
                    </p>
                    <Segmented
                      size="sm"
                      label={t.import.existingAria}
                      value={mode}
                      onChange={setMode}
                      options={[
                        { value: 'merge', label: t.import.merge },
                        { value: 'replace', label: t.import.replace },
                        { value: 'copy', label: t.import.copy },
                      ]}
                    />
                  </div>
                )}
                <Button icon="download" onClick={doImport}>
                  {t.import.importN(result.validCount)}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="h-fit p-5">
        <h3 className="font-semibold">{t.import.templates}</h3>
        <p className="mt-1 text-sm text-muted">{t.import.templatesHelp}</p>
        <div className="mt-3 grid gap-2">
          <Button variant="secondary" size="sm" icon="download" onClick={() => downloadText(JSON.stringify(template, null, 2), 'lab-rat-bank-template.json')}>
            {t.import.jsonTemplate}
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
            {t.import.csvTemplate}
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted">{t.import.topicIds(topics.map((tp) => tp.id).join(', '))}</p>
      </Card>
    </div>
  );
}
