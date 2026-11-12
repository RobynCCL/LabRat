import { useMemo, useState } from 'react';
import { topics } from '@/content/topics';
import { QUESTION_TYPES, type QuestionType } from '@/engine/questions/types';
import { slugify } from '@/engine/questions/validate';
import { buildBankPrompt, type BankRequest } from '@/lib/bankPrompt';
import { toast } from '@/lib/events';
import { Button, Card, Icon, Segmented } from '@/components/ui';
import { useI18n } from '@/i18n/useI18n';

export function RequestPanel({ onGoImport }: { onGoImport: () => void }) {
  const { t, c, lang } = useI18n();
  const [r, setR] = useState<BankRequest>({
    topic: topics[0].id,
    subtopic: '',
    count: 15,
    difficulty: 'mixed',
    types: QUESTION_TYPES.map((qt) => qt.id),
    bankId: '',
    bankName: '',
    notes: '',
    language: lang,
  });
  const set = <K extends keyof BankRequest>(k: K, v: BankRequest[K]) => setR((x) => ({ ...x, [k]: v }));
  const topic = topics.find((tp) => tp.id === r.topic)!;
  const autoName = `${r.language === 'ga' ? c.topicShort(topic) : topic.short}${r.subtopic ? ' – ' + r.subtopic : ''}${r.language === 'ga' && lang !== 'ga' ? ' (GA)' : ''}`;
  const prompt = useMemo(
    () => buildBankPrompt({ ...r, bankName: r.bankName || autoName, bankId: r.bankId || slugify(autoName + (r.language === 'ga' ? '-ga' : '')) }),
    [r, autoName],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast(t.request.copied, 'good');
    } catch {
      toast(t.request.copyFailed, 'bad');
    }
  };

  const toggleType = (qt: QuestionType) => set('types', r.types.includes(qt) ? r.types.filter((x) => x !== qt) : [...r.types, qt]);

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
      <Card className="grid h-fit gap-3 p-5">
        <h3 className="font-semibold">{t.request.what}</h3>
        <div>
          <span className="label">{t.request.language}</span>
          <Segmented size="sm" label={t.request.language} value={r.language} onChange={(v) => set('language', v)} options={[{ value: 'en', label: t.common.languageNames.en }, { value: 'ga', label: t.common.languageNames.ga }]} />
        </div>
        <label className="block">
          <span className="label">{t.request.topic}</span>
          <select className="input" value={r.topic} onChange={(e) => set('topic', e.target.value)}>
            {topics.map((tp) => (
              <option key={tp.id} value={tp.id}>
                {c.topicName(tp)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">{t.request.subtopic}</span>
          <input className="input" list="req-subtopics" value={r.subtopic} onChange={(e) => set('subtopic', e.target.value)} placeholder={t.request.subPlaceholder} />
          <datalist id="req-subtopics">
            {topic.subtopics.map((st) => (
              <option key={st} value={r.language === 'ga' ? c.subtopic(st) : st} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="label">{t.request.count(r.count)}</span>
          <input type="range" min={5} max={50} step={5} value={r.count} className="w-full accent-[rgb(var(--primary))]" onChange={(e) => set('count', Number(e.target.value))} />
        </label>
        <div>
          <span className="label">{t.request.difficulty}</span>
          <Segmented size="sm" label={t.request.difficulty} value={r.difficulty} onChange={(v) => set('difficulty', v)} options={[{ value: 'mixed', label: t.request.mixed }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]} />
        </div>
        <fieldset>
          <legend className="label">{t.request.types}</legend>
          <div className="flex flex-wrap gap-1.5">
            {QUESTION_TYPES.map((qt) => (
              <label key={qt.id} className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold ${r.types.includes(qt.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted'}`}>
                <input type="checkbox" className="sr-only" checked={r.types.includes(qt.id)} onChange={() => toggleType(qt.id)} />
                {t.editor.types[qt.id]}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="label">{t.request.bankName}</span>
          <input className="input" value={r.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder={autoName} />
        </label>
        <label className="block">
          <span className="label">{t.request.notes}</span>
          <textarea className="input min-h-[4rem]" value={r.notes} onChange={(e) => set('notes', e.target.value)} placeholder={t.request.notesPlaceholder} />
        </label>
      </Card>

      <Card className="flex flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">{t.request.yourPrompt}</h3>
            <ol className="mt-1 list-decimal pl-5 text-sm text-muted">
              <li>{t.request.step1}</li>
              <li>{t.request.step2}</li>
              <li>{t.request.step3}</li>
            </ol>
          </div>
          <div className="flex gap-2">
            <Button icon="copy" onClick={copy}>
              {t.request.copy}
            </Button>
            <Button variant="secondary" iconRight="chevron-right" onClick={onGoImport}>
              {t.request.pasteResult}
            </Button>
          </div>
        </div>
        <textarea readOnly value={prompt} className="input min-h-[28rem] flex-1 font-mono text-xs leading-relaxed" aria-label={t.request.promptAria} onFocus={(e) => e.currentTarget.select()} />
        <p className="mt-2 flex items-center gap-1 text-xs text-muted">
          <Icon name="info" size={14} /> {t.request.skim}
        </p>
      </Card>
    </div>
  );
}
