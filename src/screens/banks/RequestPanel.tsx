import { useMemo, useState } from 'react';
import { topics } from '@/content/topics';
import { QUESTION_TYPES, type QuestionType } from '@/engine/questions/types';
import { slugify } from '@/engine/questions/validate';
import { buildBankPrompt, type BankRequest } from '@/lib/bankPrompt';
import { toast } from '@/lib/events';
import { Button, Card, Icon, Segmented } from '@/components/ui';

export function RequestPanel({ onGoImport }: { onGoImport: () => void }) {
  const [r, setR] = useState<BankRequest>({
    topic: topics[0].id,
    subtopic: '',
    count: 15,
    difficulty: 'mixed',
    types: QUESTION_TYPES.map((t) => t.id),
    bankId: '',
    bankName: '',
    notes: '',
  });
  const set = <K extends keyof BankRequest>(k: K, v: BankRequest[K]) => setR((x) => ({ ...x, [k]: v }));
  const topic = topics.find((t) => t.id === r.topic)!;
  const autoName = `${topic.short}${r.subtopic ? ' – ' + r.subtopic : ''}`;
  const prompt = useMemo(
    () => buildBankPrompt({ ...r, bankName: r.bankName || autoName, bankId: r.bankId || slugify(autoName) }),
    [r, autoName],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast('Prompt copied. Paste it into Claude.', 'good');
    } catch {
      toast('Could not copy automatically. Select the text and copy it.', 'bad');
    }
  };

  const toggleType = (t: QuestionType) => set('types', r.types.includes(t) ? r.types.filter((x) => x !== t) : [...r.types, t]);

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
      <Card className="grid h-fit gap-3 p-5">
        <h3 className="font-semibold">What do you need?</h3>
        <label className="block">
          <span className="label">Topic</span>
          <select className="input" value={r.topic} onChange={(e) => set('topic', e.target.value)}>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Subtopic (optional)</span>
          <input className="input" list="req-subtopics" value={r.subtopic} onChange={(e) => set('subtopic', e.target.value)} placeholder="e.g. Hess’s law" />
          <datalist id="req-subtopics">
            {topic.subtopics.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="label">Number of questions: {r.count}</span>
          <input type="range" min={5} max={50} step={5} value={r.count} className="w-full accent-[rgb(var(--primary))]" onChange={(e) => set('count', Number(e.target.value))} />
        </label>
        <div>
          <span className="label">Difficulty</span>
          <Segmented size="sm" label="Difficulty" value={r.difficulty} onChange={(v) => set('difficulty', v)} options={[{ value: 'mixed', label: 'Mixed' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]} />
        </div>
        <fieldset>
          <legend className="label">Question types</legend>
          <div className="flex flex-wrap gap-1.5">
            {QUESTION_TYPES.map((t) => (
              <label key={t.id} className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold ${r.types.includes(t.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted'}`}>
                <input type="checkbox" className="sr-only" checked={r.types.includes(t.id)} onChange={() => toggleType(t.id)} />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="label">Bank name</span>
          <input className="input" value={r.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder={autoName} />
        </label>
        <label className="block">
          <span className="label">Extra instructions (optional)</span>
          <textarea className="input min-h-[4rem]" value={r.notes} onChange={(e) => set('notes', e.target.value)} placeholder="e.g. Focus on past exam-style calculations; include the mandatory experiment." />
        </label>
      </Card>

      <Card className="flex flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Your prompt</h3>
            <ol className="mt-1 list-decimal pl-5 text-sm text-muted">
              <li>Copy this prompt and paste it into Claude.</li>
              <li>Copy Claude's whole reply.</li>
              <li>
                Paste it into <b>Import → Paste JSON</b>. Any bad questions will be listed for you.
              </li>
            </ol>
          </div>
          <div className="flex gap-2">
            <Button icon="copy" onClick={copy}>
              Copy prompt
            </Button>
            <Button variant="secondary" iconRight="chevron-right" onClick={onGoImport}>
              Paste result
            </Button>
          </div>
        </div>
        <textarea readOnly value={prompt} className="input min-h-[28rem] flex-1 font-mono text-xs leading-relaxed" aria-label="Generated prompt" onFocus={(e) => e.currentTarget.select()} />
        <p className="mt-2 flex items-center gap-1 text-xs text-muted">
          <Icon name="info" size={14} /> Always skim AI-written questions for accuracy before relying on them.
        </p>
      </Card>
    </div>
  );
}
