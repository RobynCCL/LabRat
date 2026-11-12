import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CheckResult, PoolQuestion, Response } from '@/engine/questions/types';
import { checkAnswer, describeAnswer } from '@/engine/questions/checkAnswer';
import { formatChem } from '@/engine/questions/formatChem';
import { shuffle } from '@/lib/questionPool';
import { play } from '@/lib/sound';
import { topicById } from '@/content/topics';
import { Button, ChemText, Icon, Kbd, TopicBadge } from '@/components/ui';
import { useI18n } from '@/i18n/useI18n';
import type { Dict } from '@/i18n';

export interface AnswerOutcome {
  result: CheckResult;
  response: Response;
}

interface Props {
  question: PoolQuestion;
  /** Called once when the player submits. */
  onAnswered: (o: AnswerOutcome) => void;
  /** Called when the player clicks Next after feedback. */
  onNext: () => void;
  nextLabel?: string;
  /** Extra info shown in the header (e.g. "Question 3 of 10"). */
  meta?: React.ReactNode;
}


function initialResponse(q: PoolQuestion, order: number[], rightOrder: string[]): Response {
  switch (q.type) {
    case 'mcq':
      return { type: 'mcq', choice: null };
    case 'multi':
      return { type: 'multi', choices: [] };
    case 'numeric':
      return { type: 'numeric', value: '' };
    case 'text':
      return { type: 'text', value: '' };
    case 'order': {
      return { type: 'order', items: order.map((i) => q.answer[i]) };
    }
    case 'match':
      void rightOrder;
      return { type: 'match', pairs: {} };
  }
}

function isAnswerable(r: Response, q: PoolQuestion): boolean {
  switch (r.type) {
    case 'mcq':
      return r.choice !== null;
    case 'multi':
      return r.choices.length > 0;
    case 'numeric':
    case 'text':
      return r.value.trim().length > 0;
    case 'order':
      return true;
    case 'match':
      return q.type === 'match' && Object.keys(r.pairs).length === q.answer.length;
  }
}

export function QuestionView({ question: q, onAnswered, onNext, nextLabel = 'Next', meta }: Props) {
  // Display orders are fixed per question instance.
  const { optOrder, itemOrder, rightOrder } = useMemo(() => {
    const noShuffle = q.tags?.includes('no-shuffle');
    const opts = 'options' in q ? q.options.map((_, i) => i) : [];
    let items: number[] = [];
    if (q.type === 'order') {
      items = q.answer.map((_, i) => i);
      // make sure the starting order isn't already correct
      for (let k = 0; k < 5 && items.every((v, i) => v === i); k++) items = shuffle(items);
    }
    const rights = q.type === 'match' ? shuffle(q.answer.map((p) => p[1])) : [];
    return { optOrder: noShuffle ? opts : shuffle(opts), itemOrder: items, rightOrder: rights };
  }, [q]);

  const [resp, setResp] = useState<Response>(() => initialResponse(q, itemOrder, rightOrder));
  const [outcome, setOutcome] = useState<CheckResult | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, c } = useI18n();

  useEffect(() => {
    setResp(initialResponse(q, itemOrder, rightOrder));
    setOutcome(null);
    if (q.type === 'numeric' || q.type === 'text') setTimeout(() => inputRef.current?.focus(), 50);
  }, [q, itemOrder, rightOrder]);

  const answered = outcome !== null;
  const canSubmit = !answered && isAnswerable(resp, q);

  const submit = () => {
    if (!canSubmit) return;
    const result = checkAnswer(q, resp);
    setOutcome(result);
    play(result.correct ? 'correct' : 'wrong');
    onAnswered({ result, response: resp });
    setTimeout(() => nextRef.current?.focus(), 30);
  };

  // Keyboard: 1–9 pick options, Enter submits / goes next.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (e.key === 'Enter' && !e.shiftKey) {
        const role = (e.target as HTMLElement)?.getAttribute?.('role');
        // A focused button handles Enter itself, except answer options (Enter = check).
        if (tag === 'BUTTON' && role !== 'radio' && role !== 'checkbox') return;
        if (answered) {
          e.preventDefault();
          onNext();
        } else if (canSubmit) {
          e.preventDefault();
          submit();
        }
        return;
      }
      if (typing || answered || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = parseInt(e.key, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= optOrder.length) {
        const idx = optOrder[n - 1];
        if (q.type === 'mcq') setResp({ type: 'mcq', choice: idx });
        if (q.type === 'multi')
          setResp((r) => {
            const c = (r as Extract<Response, { type: 'multi' }>).choices;
            return { type: 'multi', choices: c.includes(idx) ? c.filter((x) => x !== idx) : [...c, idx] };
          });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const topic = topicById(q.topic);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted">
        <TopicBadge topic={q.topic} size={26} />
        <span className="font-semibold text-ink">{c.topicShort(topic, q.topic)}</span>
        {q.subtopic && <span>· {c.subtopic(q.subtopic)}</span>}
        <span className="chip" title={t.question.difficulty}>
          {'●'.repeat(q.difficulty)}
          <span className="opacity-40">{'●'.repeat(3 - q.difficulty)}</span>
          <span className="ml-1">{t.question.difficulties[q.difficulty]}</span>
        </span>
        <span className="ml-auto">{meta}</span>
      </div>

      <div className="card p-5 sm:p-7">
        <ChemText as="p" text={q.question} className="font-display text-xl leading-snug sm:text-2xl" />
        {q.type === 'multi' && !answered && <p className="mt-1 text-sm text-muted">{t.question.selectAll}</p>}

        <div className="mt-5">
          {(q.type === 'mcq' || q.type === 'multi') && (
            <div className="grid gap-2.5" role={q.type === 'mcq' ? 'radiogroup' : 'group'} aria-label={t.question.options}>
              {optOrder.map((oi, pos) => {
                const chosen = resp.type === 'mcq' ? resp.choice === oi : resp.type === 'multi' && resp.choices.includes(oi);
                const isRight = q.type === 'mcq' ? q.answer === oi : q.answer.includes(oi);
                let state: 'idle' | 'chosen' | 'right' | 'wrong' | 'missed' = chosen ? 'chosen' : 'idle';
                if (answered) state = isRight ? (chosen ? 'right' : 'missed') : chosen ? 'wrong' : 'idle';
                return (
                  <OptionButton
                    key={oi}
                    index={pos}
                    multi={q.type === 'multi'}
                    state={state}
                    disabled={answered}
                    text={q.options[oi]}
                    t={t}
                    onClick={() => {
                      if (q.type === 'mcq') setResp({ type: 'mcq', choice: oi });
                      else
                        setResp((r) => {
                          const c = (r as Extract<Response, { type: 'multi' }>).choices;
                          return { type: 'multi', choices: c.includes(oi) ? c.filter((x) => x !== oi) : [...c, oi] };
                        });
                    }}
                  />
                );
              })}
            </div>
          )}

          {(q.type === 'numeric' || q.type === 'text') && (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                className={`input h-12 text-lg ${answered ? (outcome?.correct ? 'border-good ring-2 ring-good/30' : 'border-bad ring-2 ring-bad/30') : ''}`}
                inputMode={q.type === 'numeric' ? 'decimal' : 'text'}
                autoComplete="off"
                spellCheck={false}
                aria-label={t.question.yourAnswer}
                placeholder={q.type === 'numeric' ? t.question.numericPlaceholder : t.question.textPlaceholder}
                value={(resp as { value: string }).value}
                disabled={answered}
                onChange={(e) => setResp({ type: q.type, value: e.target.value } as Response)}
              />
              {q.type === 'numeric' && q.answer.unit && <span className="whitespace-nowrap text-lg font-semibold text-muted">{formatChem(q.answer.unit)}</span>}
            </div>
          )}
          {q.type === 'text' && !answered && (resp as { value: string }).value && (
            <p className="mt-2 text-sm text-muted">
              {t.question.preview} <ChemText text={(resp as { value: string }).value} className="font-semibold text-ink" />
            </p>
          )}

          {q.type === 'order' && resp.type === 'order' && (
            <OrderInput t={t} items={resp.items} answered={answered} truth={q.answer} onChange={(items) => setResp({ type: 'order', items })} />
          )}

          {q.type === 'match' && resp.type === 'match' && (
            <MatchInput t={t} pairs={q.answer} rights={rightOrder} value={resp.pairs} answered={answered} onChange={(pairs) => setResp({ type: 'match', pairs })} />
          )}
        </div>

        {!answered && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="hidden text-xs text-muted sm:block">
              {(q.type === 'mcq' || q.type === 'multi') && (
                <>
                  <Kbd>1</Kbd>–<Kbd>{optOrder.length}</Kbd> {t.question.choose} ·{' '}
                </>
              )}
              <Kbd>Enter</Kbd> {t.question.check}
            </p>
            <Button onClick={submit} disabled={!canSubmit} size="lg" icon="check" className="ml-auto">
              {t.question.checkAnswer}
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {answered && outcome && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 rounded-2xl border-2 p-5 ${outcome.correct ? 'border-good/50 bg-good/5' : 'border-bad/50 bg-bad/5'}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${outcome.correct ? 'bg-good' : 'bg-bad'}`}>
                <Icon name={outcome.correct ? 'check' : 'x'} size={22} strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`font-display text-xl font-semibold ${outcome.correct ? 'text-good' : 'text-bad'}`}>
                  {outcome.correct ? t.question.correct : outcome.score > 0 ? t.question.partly(Math.round(outcome.score * 100)) : t.question.notQuite}
                </p>
                {outcome.note && <p className="mt-1 text-sm font-semibold">{t.question.notes[outcome.note]}</p>}
                {!outcome.correct && (
                  <p className="mt-1">
                    <span className="text-muted">{t.question.answer} </span>
                    <ChemText text={describeAnswer(q)} className="font-semibold" />
                  </p>
                )}
                {q.explanation && <ChemText as="p" text={q.explanation} className="mt-2 leading-relaxed text-ink/90" />}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              <span className="hidden text-xs text-muted sm:inline">
                <Kbd>Enter</Kbd>
              </span>
              <Button ref={nextRef} onClick={onNext} iconRight="chevron-right" size="lg">
                {nextLabel}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionButton({ index, text, state, onClick, disabled, multi, t }: { index: number; text: string; state: 'idle' | 'chosen' | 'right' | 'wrong' | 'missed'; onClick: () => void; disabled: boolean; multi: boolean; t: Dict }) {
  const styles = {
    idle: 'border-border bg-surface hover:border-primary/60 hover:bg-primary/5',
    chosen: 'border-primary bg-primary/10 ring-2 ring-primary/30',
    right: 'border-good bg-good/10',
    wrong: 'border-bad border-dashed bg-bad/10',
    missed: 'border-good border-dashed bg-surface',
  }[state];
  const marker =
    state === 'right' ? <Icon name="check" size={16} strokeWidth={3} /> : state === 'wrong' ? <Icon name="x" size={16} strokeWidth={3} /> : state === 'missed' ? <Icon name="check" size={16} strokeWidth={3} /> : index + 1;
  const markerStyle =
    state === 'right' ? 'bg-good text-white' : state === 'wrong' ? 'bg-bad text-white' : state === 'missed' ? 'border-2 border-good text-good' : state === 'chosen' ? 'bg-primary text-primary-ink' : 'bg-surface-2 text-muted';
  return (
    <button
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={state === 'chosen' || state === 'right' || state === 'wrong'}
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition disabled:cursor-default ${styles}`}
    >
      <span className={`grid h-7 w-7 shrink-0 place-items-center ${multi ? 'rounded-md' : 'rounded-full'} text-sm font-bold ${markerStyle}`}>{marker}</span>
      <ChemText text={text} className="flex-1 font-semibold" />
      {state === 'missed' && <span className="text-xs font-bold text-good">{t.question.correctAnswer}</span>}
      {state === 'wrong' && <span className="text-xs font-bold text-bad">{t.question.yourChoice}</span>}
    </button>
  );
}

function OrderInput({ items, onChange, answered, truth, t }: { items: string[]; onChange: (i: string[]) => void; answered: boolean; truth: string[]; t: Dict }) {
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      {!answered && <p className="mb-2 text-sm text-muted">{t.question.orderHelp}</p>}
      <Reorder.Group axis="y" values={items} onReorder={answered ? () => {} : onChange} className="grid gap-2">
        {items.map((it, i) => {
          const ok = answered && truth[i] === it;
          return (
            <Reorder.Item
              key={it}
              value={it}
              dragListener={!answered}
              className={`flex select-none items-center gap-3 rounded-xl border-2 bg-surface px-3 py-2.5 ${answered ? (ok ? 'border-good bg-good/10' : 'border-dashed border-bad bg-bad/10') : 'cursor-grab border-border active:cursor-grabbing'}`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-sm font-bold text-muted">{i + 1}</span>
              {!answered && <Icon name="grip" className="text-muted" />}
              <ChemText text={it} className="flex-1 font-semibold" />
              {answered ? (
                <span className={`flex items-center gap-1 text-xs font-bold ${ok ? 'text-good' : 'text-bad'}`}>
                  <Icon name={ok ? 'check' : 'x'} size={16} strokeWidth={3} />
                  {!ok && <>{t.question.shouldBe(truth.indexOf(it) + 1)}</>}
                </span>
              ) : (
                <span className="flex gap-1">
                  <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2 disabled:opacity-30" aria-label={t.question.moveUp(formatChem(it))} disabled={i === 0} onClick={() => move(i, -1)}>
                    <Icon name="arrow-up" size={16} />
                  </button>
                  <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2 disabled:opacity-30" aria-label={t.question.moveDown(formatChem(it))} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                    <Icon name="arrow-down" size={16} />
                  </button>
                </span>
              )}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}

function MatchInput({ pairs, rights, value, onChange, answered, t }: { pairs: [string, string][]; rights: string[]; value: Record<string, string>; onChange: (v: Record<string, string>) => void; answered: boolean; t: Dict }) {
  const used = new Set(Object.values(value));
  return (
    <div className="grid gap-2.5">
      {!answered && <p className="text-sm text-muted">{t.question.matchHelp}</p>}
      {pairs.map(([left, right]) => {
        const v = value[left] ?? '';
        const ok = answered && v === right;
        return (
          <div key={left} className={`grid items-center gap-2 rounded-xl border-2 p-2.5 sm:grid-cols-[1fr_auto_1.4fr] ${answered ? (ok ? 'border-good bg-good/10' : 'border-dashed border-bad bg-bad/10') : 'border-border bg-surface'}`}>
            <ChemText text={left} className="px-1 font-semibold" />
            <Icon name="chevron-right" className="hidden text-muted sm:block" />
            {answered ? (
              <div className="flex items-center gap-2 px-1">
                <Icon name={ok ? 'check' : 'x'} size={16} strokeWidth={3} className={ok ? 'text-good' : 'text-bad'} />
                <span>
                  <ChemText text={v || '—'} className={ok ? 'font-semibold' : 'line-through opacity-70'} />
                  {!ok && (
                    <>
                      {' '}
                      → <ChemText text={right} className="font-semibold" />
                    </>
                  )}
                </span>
              </div>
            ) : (
              <select
                className="input"
                aria-label={t.question.matchFor(formatChem(left))}
                value={v}
                onChange={(e) => {
                  const next = { ...value };
                  if (e.target.value) next[left] = e.target.value;
                  else delete next[left];
                  onChange(next);
                }}
              >
                <option value="">{t.question.choosePlaceholder}</option>
                {rights.map((r) => (
                  <option key={r} value={r} disabled={used.has(r) && v !== r}>
                    {formatChem(r)}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}
