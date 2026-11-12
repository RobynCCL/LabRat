import { useEffect, useState } from 'react';
import { topics } from '@/content/topics';
import { QUESTION_TYPES, type Question, type QuestionType } from '@/engine/questions/types';
import { validateQuestion, type ValidationIssue } from '@/engine/questions/validate';
import { Button, ChemText, Icon, IconButton, Modal } from '@/components/ui';
import { useI18n } from '@/i18n/useI18n';
import { formatIssue } from '@/i18n';

/** Editable form state – everything as strings so inputs stay controlled. */
interface Draft {
  id: string;
  topic: string;
  subtopic: string;
  type: QuestionType;
  difficulty: 1 | 2 | 3;
  question: string;
  explanation: string;
  tags: string;
  options: string[];
  correct: number[];
  value: string;
  tolerance: string;
  unit: string;
  accepted: string;
  caseSensitive: boolean;
  items: string;
  pairs: [string, string][];
}

function toDraft(q?: Question, defaults?: Partial<Draft>): Draft {
  const d: Draft = {
    id: '',
    topic: topics[0].id,
    subtopic: '',
    type: 'mcq',
    difficulty: 2,
    question: '',
    explanation: '',
    tags: '',
    options: ['', '', '', ''],
    correct: [0],
    value: '',
    tolerance: '',
    unit: '',
    accepted: '',
    caseSensitive: false,
    items: '',
    pairs: [
      ['', ''],
      ['', ''],
      ['', ''],
    ],
    ...defaults,
  };
  if (!q) return d;
  Object.assign(d, { id: q.id, topic: q.topic, subtopic: q.subtopic ?? '', type: q.type, difficulty: q.difficulty, question: q.question, explanation: q.explanation, tags: (q.tags ?? []).join(', ') });
  if (q.type === 'mcq') Object.assign(d, { options: q.options, correct: [q.answer] });
  if (q.type === 'multi') Object.assign(d, { options: q.options, correct: q.answer });
  if (q.type === 'numeric') Object.assign(d, { value: String(q.answer.value), tolerance: q.answer.tolerance != null ? String(q.answer.tolerance) : '', unit: q.answer.unit ?? '' });
  if (q.type === 'text') Object.assign(d, { accepted: q.answer.join('\n'), caseSensitive: !!q.caseSensitive });
  if (q.type === 'order') d.items = q.answer.join('\n');
  if (q.type === 'match') d.pairs = q.answer.map((p) => [...p] as [string, string]);
  return d;
}

function fromDraft(d: Draft): Record<string, unknown> {
  const lines = (s: string) =>
    s
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
  const base: Record<string, unknown> = {
    id: d.id.trim(),
    topic: d.topic,
    subtopic: d.subtopic.trim() || undefined,
    type: d.type,
    difficulty: d.difficulty,
    question: d.question,
    explanation: d.explanation,
    tags: d.tags.split(',').map((t) => t.trim()).filter(Boolean),
  };
  const opts = d.options.map((o) => o.trim());
  switch (d.type) {
    case 'mcq':
      return { ...base, options: opts.filter(Boolean), answer: d.correct[0] };
    case 'multi':
      return { ...base, options: opts.filter(Boolean), answer: d.correct };
    case 'numeric':
      return {
        ...base,
        answer: {
          value: d.value.trim() === '' ? NaN : Number(d.value.replace(',', '.')),
          ...(d.tolerance.trim() ? { tolerance: Number(d.tolerance) } : {}),
          ...(d.unit.trim() ? { unit: d.unit.trim() } : {}),
        },
      };
    case 'text':
      return { ...base, answer: lines(d.accepted), caseSensitive: d.caseSensitive || undefined };
    case 'order':
      return { ...base, answer: lines(d.items) };
    case 'match':
      return { ...base, answer: d.pairs.filter(([l, r]) => l.trim() || r.trim()).map(([l, r]) => [l.trim(), r.trim()]) };
  }
}

export function QuestionEditor({
  open,
  onClose,
  question,
  existingIds,
  onSave,
  defaults,
}: {
  open: boolean;
  onClose: () => void;
  question?: Question;
  existingIds: string[];
  onSave: (q: Question, previousId?: string) => void;
  defaults?: Partial<Draft>;
}) {
  const [d, setD] = useState<Draft>(() => toDraft(question, defaults));
  const { t, c } = useI18n();
  const [errors, setErrors] = useState<ValidationIssue[]>([]);
  useEffect(() => {
    if (open) {
      setD(toDraft(question, defaults));
      setErrors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, question]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const topic = topics.find((t) => t.id === d.topic);
  const err = (field: string) => {
    const found = errors.find((e) => e.field === field || e.field?.startsWith(field + '.'));
    return found ? (found.field === 'id' && found.code === 'duplicateId' ? t.editor.duplicateId(String(found.params[0])) : formatIssue(t, found)) : undefined;
  };

  const save = () => {
    const raw = fromDraft(d);
    const res = validateQuestion(raw, topics);
    const errs = [...res.errors];
    const id = String(raw.id);
    if (id && id !== question?.id && existingIds.includes(id)) errs.push({ row: null, field: 'id', code: 'duplicateId', params: [id], message: `Duplicate id "${id}".` });
    setErrors(errs);
    if (errs.length || !res.question) return;
    onSave(res.question, question?.id);
    onClose();
  };

  const suggestId = () => {
    const prefix = (topic?.symbol ?? 'q').toLowerCase();
    let n = 1;
    while (existingIds.includes(`${prefix}-${String(n).padStart(2, '0')}`)) n++;
    set('id', `${prefix}-${String(n).padStart(2, '0')}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={question ? t.editor.editTitle : t.editor.newTitle}
      wide
      footer={
        <>
          {errors.length > 0 && <span className="mr-auto self-center text-sm font-semibold text-bad">{t.editor.fixN(errors.length)}</span>}
          <Button variant="secondary" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button icon="check" onClick={save}>
            {t.editor.save}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label={t.editor.type} className="sm:col-span-2">
            <select className="input" value={d.type} onChange={(e) => set('type', e.target.value as QuestionType)}>
              {QUESTION_TYPES.map((qt) => (
                <option key={qt.id} value={qt.id}>
                  {t.editor.types[qt.id]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.editor.difficulty}>
            <select className="input" value={d.difficulty} onChange={(e) => set('difficulty', Number(e.target.value) as 1 | 2 | 3)}>
              <option value={1}>{t.editor.diffOptions[1]}</option>
              <option value={2}>{t.editor.diffOptions[2]}</option>
              <option value={3}>{t.editor.diffOptions[3]}</option>
            </select>
          </Field>
          <Field label={t.editor.id} error={err('id')}>
            <div className="flex gap-1">
              <input className="input" value={d.id} onChange={(e) => set('id', e.target.value)} placeholder={t.editor.idPlaceholder} />
              <IconButton icon="sparkles" label={t.editor.suggestId} onClick={suggestId} />
            </div>
          </Field>
          <Field label={t.editor.topic} className="sm:col-span-2" error={err('topic')}>
            <select className="input" value={d.topic} onChange={(e) => set('topic', e.target.value)}>
              {topics.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {c.topicName(tp)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.editor.subtopic} className="sm:col-span-2">
            <input className="input" list="subtopics" value={d.subtopic} onChange={(e) => set('subtopic', e.target.value)} placeholder={t.editor.optional} />
            <datalist id="subtopics">
              {topic?.subtopics.map((st) => (
                <option key={st} value={c.subtopic(st)} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field label={t.editor.question} error={err('question')}>
          <textarea className="input min-h-[4.5rem]" value={d.question} onChange={(e) => set('question', e.target.value)} placeholder={t.editor.questionPlaceholder} />
          {d.question && (
            <p className="mt-1 text-sm text-muted">
              {t.editor.preview} <ChemText text={d.question} className="text-ink" />
            </p>
          )}
        </Field>

        {/* Type-specific answer fields */}
        <div className="rounded-2xl bg-surface-2 p-4">
          <div className="mb-2 text-sm font-bold">{t.editor.answer}</div>
          {(d.type === 'mcq' || d.type === 'multi') && (
            <div className="grid gap-2">
              <p className="text-xs text-muted">{d.type === 'mcq' ? t.editor.tickOne : t.editor.tickAll}</p>
              {d.options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type={d.type === 'mcq' ? 'radio' : 'checkbox'}
                    name="correct"
                    aria-label={t.editor.optionCorrect(i + 1)}
                    className="h-5 w-5 accent-[rgb(var(--primary))]"
                    checked={d.correct.includes(i)}
                    onChange={(e) => set('correct', d.type === 'mcq' ? [i] : e.target.checked ? [...d.correct, i] : d.correct.filter((x) => x !== i))}
                  />
                  <input className="input" value={o} placeholder={t.editor.option(i + 1)} onChange={(e) => set('options', d.options.map((x, j) => (j === i ? e.target.value : x)))} />
                  <IconButton
                    icon="trash"
                    label={t.editor.removeOption(i + 1)}
                    disabled={d.options.length <= 2}
                    onClick={() => {
                      set('options', d.options.filter((_, j) => j !== i));
                      set('correct', d.correct.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)));
                    }}
                  />
                </div>
              ))}
              {d.options.length < 8 && (
                <Button size="sm" variant="ghost" icon="plus" className="justify-self-start" onClick={() => set('options', [...d.options, ''])}>
                  {t.editor.addOption}
                </Button>
              )}
            </div>
          )}
          {d.type === 'numeric' && (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t.editor.value} error={err('answer')}>
                <input className="input" inputMode="decimal" value={d.value} onChange={(e) => set('value', e.target.value)} placeholder="0.1" />
              </Field>
              <Field label={t.editor.tolerance}>
                <input className="input" inputMode="decimal" value={d.tolerance} onChange={(e) => set('tolerance', e.target.value)} placeholder={t.editor.toleranceDefault} />
              </Field>
              <Field label={t.editor.unit}>
                <input className="input" value={d.unit} onChange={(e) => set('unit', e.target.value)} placeholder={t.editor.unitPlaceholder} />
              </Field>
            </div>
          )}
          {d.type === 'text' && (
            <div className="grid gap-2">
              <Field label={t.editor.accepted} error={err('answer')}>
                <textarea className="input min-h-[5rem]" value={d.accepted} onChange={(e) => set('accepted', e.target.value)} placeholder={'manganese dioxide\nMnO2'} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--primary))]" checked={d.caseSensitive} onChange={(e) => set('caseSensitive', e.target.checked)} />
                {t.editor.caseSensitive}
              </label>
            </div>
          )}
          {d.type === 'order' && (
            <Field label={t.editor.orderItems} error={err('answer')}>
              <textarea className="input min-h-[6rem]" value={d.items} onChange={(e) => set('items', e.target.value)} placeholder={'Methane\nEthane\nPropane'} />
            </Field>
          )}
          {d.type === 'match' && (
            <div className="grid gap-2">
              {err('answer') && <p className="text-sm font-semibold text-bad">{err('answer')}</p>}
              {d.pairs.map(([l, r], i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                  <input className="input" value={l}  placeholder={t.editor.left} onChange={(e) => set('pairs', d.pairs.map((p, j) => (j === i ? [e.target.value, p[1]] : p)))} />
                  <Icon name="chevron-right" className="text-muted" />
                  <input className="input" value={r} placeholder={t.editor.matches} onChange={(e) => set('pairs', d.pairs.map((p, j) => (j === i ? [p[0], e.target.value] : p)))} />
                  <IconButton icon="trash" label={t.editor.removePair(i + 1)} disabled={d.pairs.length <= 2} onClick={() => set('pairs', d.pairs.filter((_, j) => j !== i))} />
                </div>
              ))}
              {d.pairs.length < 8 && (
                <Button size="sm" variant="ghost" icon="plus" className="justify-self-start" onClick={() => set('pairs', [...d.pairs, ['', '']])}>
                  {t.editor.addPair}
                </Button>
              )}
            </div>
          )}
          {(d.type === 'mcq' || d.type === 'multi') && err('answer') && <p className="mt-2 text-sm font-semibold text-bad">{err('answer')}</p>}
          {(d.type === 'mcq' || d.type === 'multi') && err('options') && <p className="mt-2 text-sm font-semibold text-bad">{err('options')}</p>}
        </div>

        <Field label={t.editor.explanation}>
          <textarea className="input min-h-[4rem]" value={d.explanation} onChange={(e) => set('explanation', e.target.value)} />
        </Field>
        <Field label={t.editor.tags}>
          <input className="input" value={d.tags} onChange={(e) => set('tags', e.target.value)} placeholder={t.editor.tagsPlaceholder} />
        </Field>
        {errors.filter((e) => !['id', 'topic', 'question', 'answer', 'options'].some((f) => e.field?.startsWith(f))).map((e, i) => (
          <p key={i} className="text-sm font-semibold text-bad">
            {formatIssue(t, e)}
          </p>
        ))}
      </div>
    </Modal>
  );
}

function Field({ label, children, className = '', error }: { label: string; children: React.ReactNode; className?: string; error?: string }) {
  return (
    <div className={className}>
      <label className="block">
        <span className="label">{label}</span>
        {children}
      </label>
      {error && <p className="mt-1 text-sm font-semibold text-bad">{error}</p>}
    </div>
  );
}
