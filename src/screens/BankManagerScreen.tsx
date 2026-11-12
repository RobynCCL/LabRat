import { useMemo, useState } from 'react';
import { useGame } from '@/store/game';
import { topics, topicById } from '@/content/topics';
import { QUESTION_TYPES, type Question, type QuestionBank } from '@/engine/questions/types';
import { questionsToCsv } from '@/engine/questions/csv';
import { slugify } from '@/engine/questions/validate';
import { allBanks, uidOf } from '@/lib/questionPool';
import { downloadText } from '@/lib/exportPng';
import { toast } from '@/lib/events';
import { Button, Card, ChemText, EmptyState, Icon, IconButton, Modal, PageHeader, Toggle, TopicBadge } from '@/components/ui';
import { QuestionView } from '@/components/question/QuestionView';
import { QuestionEditor } from './banks/QuestionEditor';
import { ImportPanel } from './banks/ImportPanel';
import { RequestPanel } from './banks/RequestPanel';

type Tab = 'banks' | 'import' | 'request';

export default function BankManagerScreen() {
  const [tab, setTab] = useState<Tab>('banks');
  const [openBank, setOpenBank] = useState<string | null>(null);
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'banks', label: 'Banks', icon: 'book' },
    { id: 'import', label: 'Import', icon: 'upload' },
    { id: 'request', label: 'Request a bank', icon: 'sparkles' },
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Question banks" icon="book" subtitle="Manage, import, edit and request question banks." />
      <div className="mb-5 flex gap-1 border-b border-border" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}
          >
            <Icon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'banks' && <BanksTab openBank={openBank} setOpenBank={setOpenBank} />}
      {tab === 'import' && (
        <ImportPanel
          onDone={(id) => {
            setOpenBank(id);
            setTab('banks');
          }}
        />
      )}
      {tab === 'request' && <RequestPanel onGoImport={() => setTab('import')} />}
    </div>
  );
}

function BanksTab({ openBank, setOpenBank }: { openBank: string | null; setOpenBank: (id: string | null) => void }) {
  const save = useGame((g) => g.save);
  const index = useGame((g) => g.index);
  const { setBankEnabled, upsertBank, deleteBank } = useGame.getState();
  const banks = allBanks(save.banks.user, save.banks.disabled);
  const [confirmDelete, setConfirmDelete] = useState<QuestionBank | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const createBank = () => {
    const name = newName.trim() || 'My questions';
    let id = slugify(name) || 'my-bank';
    let n = 2;
    while (banks.some((b) => b.bank.bankId === id)) id = `${slugify(name)}-${n++}`;
    upsertBank({ bankId: id, name, version: 1, questions: [] });
    setNewOpen(false);
    setNewName('');
    setOpenBank(id);
  };

  const duplicate = (b: QuestionBank) => {
    let id = `${b.bankId}-copy`;
    let n = 2;
    while (banks.some((x) => x.bank.bankId === id)) id = `${b.bankId}-copy-${n++}`;
    upsertBank({ ...b, bankId: id, name: `${b.name} (my copy)`, sample: undefined });
    toast('Copied. You can edit this version.', 'good');
    setOpenBank(id);
  };

  const exportJson = (b: QuestionBank) => downloadText(JSON.stringify(b, null, 2), `${b.bankId}.json`);
  const exportCsv = (b: QuestionBank) => downloadText(questionsToCsv(b.questions), `${b.bankId}.csv`, 'text/csv');

  const selected = banks.find((b) => b.bank.bankId === openBank);

  return (
    <div className="grid gap-5">
      <Card className="p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Enabled questions per topic</h2>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <span key={t.id} className={`flex items-center gap-1.5 rounded-full border border-border py-0.5 pl-0.5 pr-2.5 text-sm ${index[t.id]?.length ? '' : 'opacity-50'}`} title={t.name}>
              <TopicBadge topic={t.id} size={22} />
              <span className="font-semibold">{t.short}</span>
              <span className="text-muted num">{index[t.id]?.length ?? 0}</span>
            </span>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your banks</h2>
        <Button size="sm" icon="plus" onClick={() => setNewOpen(true)}>
          New bank
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {banks.map(({ bank, builtIn, enabled }) => {
          const topicCounts = topics.map((t) => ({ t, n: bank.questions.filter((q) => q.topic === t.id).length })).filter((x) => x.n);
          return (
            <Card key={bank.bankId} className={`p-4 transition ${openBank === bank.bankId ? 'ring-2 ring-primary' : ''} ${enabled ? '' : 'opacity-70'}`}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{bank.name}</h3>
                    {bank.sample && <span className="chip bg-warn/15 text-warn">Sample</span>}
                    <span className="chip">{builtIn ? 'Built-in' : 'Yours'}</span>
                  </div>
                  <p className="text-sm text-muted">
                    {bank.questions.length} question{bank.questions.length === 1 ? '' : 's'} · v{bank.version} · <span className="font-mono text-xs">{bank.bankId}</span>
                  </p>
                  {bank.description && <p className="mt-1 text-sm text-muted">{bank.description}</p>}
                </div>
                <div className="w-24 shrink-0">
                  <Toggle label={enabled ? 'On' : 'Off'} checked={enabled} onChange={(v) => setBankEnabled(bank.bankId, v)} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {topicCounts.map(({ t, n }) => (
                  <span key={t.id} className="chip">
                    {t.symbol} {n}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button size="sm" variant={openBank === bank.bankId ? 'primary' : 'secondary'} icon={builtIn ? 'book' : 'edit'} onClick={() => setOpenBank(openBank === bank.bankId ? null : bank.bankId)}>
                  {builtIn ? 'View' : 'Edit questions'}
                </Button>
                <Button size="sm" variant="ghost" icon="download" onClick={() => exportJson(bank)}>
                  JSON
                </Button>
                <Button size="sm" variant="ghost" icon="download" onClick={() => exportCsv(bank)}>
                  CSV
                </Button>
                {builtIn ? (
                  <Button size="sm" variant="ghost" icon="copy" onClick={() => duplicate(bank)}>
                    Copy to edit
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" icon="trash" onClick={() => setConfirmDelete(bank)}>
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {selected && <BankQuestions bank={selected.bank} editable={!selected.builtIn} onClose={() => setOpenBank(null)} />}

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New question bank"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createBank}>Create</Button>
          </>
        }
      >
        <label className="block">
          <span className="label">Bank name</span>
          <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Organic – my notes" onKeyDown={(e) => e.key === 'Enter' && createBank()} />
        </label>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete bank?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon="trash"
              onClick={() => {
                if (confirmDelete) {
                  deleteBank(confirmDelete.bankId);
                  if (openBank === confirmDelete.bankId) setOpenBank(null);
                  toast('Bank deleted');
                }
                setConfirmDelete(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete <b>{confirmDelete?.name}</b> and its {confirmDelete?.questions.length} questions? Export it first if you might want it back.
        </p>
      </Modal>
    </div>
  );
}

function BankQuestions({ bank, editable, onClose }: { bank: QuestionBank; editable: boolean; onClose: () => void }) {
  const { upsertQuestion, deleteQuestion } = useGame.getState();
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [editing, setEditing] = useState<Question | null | 'new'>(null);
  const [trying, setTrying] = useState<Question | null>(null);
  const [toDelete, setToDelete] = useState<Question | null>(null);

  const list = useMemo(
    () =>
      bank.questions.filter(
        (q) => (!topic || q.topic === topic) && (!search || `${q.id} ${q.question} ${q.subtopic ?? ''} ${(q.tags ?? []).join(' ')}`.toLowerCase().includes(search.toLowerCase())),
      ),
    [bank.questions, topic, search],
  );
  const typeLabel = (t: string) => QUESTION_TYPES.find((x) => x.id === t)?.label ?? t;

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-lg font-semibold">
          {bank.name} <span className="text-muted">· {bank.questions.length}</span>
        </h2>
        <input className="input h-9 w-48" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search questions" />
        <select className="input h-9 w-44" value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Filter by topic">
          <option value="">All topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.short}
            </option>
          ))}
        </select>
        {editable && (
          <Button size="sm" icon="plus" onClick={() => setEditing('new')}>
            Add question
          </Button>
        )}
        <IconButton icon="x" label="Close bank" onClick={onClose} />
      </div>
      {!editable && <p className="mb-3 rounded-xl bg-surface-2 p-3 text-sm text-muted">Built-in banks are read-only. Use “Copy to edit” to make your own editable version.</p>}
      {list.length === 0 ? (
        <EmptyState icon="book" title={bank.questions.length ? 'No questions match' : 'This bank is empty'}>
          {editable && !bank.questions.length && 'Add questions with the form, or import JSON/CSV into this bank (use the same bankId).'}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border">
          {list.map((q) => (
            <li key={q.id} className="flex items-start gap-3 py-2.5">
              <TopicBadge topic={q.topic} size={28} />
              <div className="min-w-0 flex-1">
                <ChemText text={q.question} className="line-clamp-2 text-sm font-semibold" as="p" />
                <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted">
                  <span className="font-mono">{q.id}</span>
                  <span>{typeLabel(q.type)}</span>
                  <span>Difficulty {q.difficulty}</span>
                  <span>{topicById(q.topic)?.short}</span>
                  {q.subtopic && <span>· {q.subtopic}</span>}
                </div>
              </div>
              <div className="flex shrink-0">
                <IconButton icon="play" label="Try this question" onClick={() => setTrying(q)} />
                {editable && (
                  <>
                    <IconButton icon="edit" label="Edit" onClick={() => setEditing(q)} />
                    <IconButton icon="trash" label="Delete" onClick={() => setToDelete(q)} />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <QuestionEditor
        open={editing !== null}
        onClose={() => setEditing(null)}
        question={editing && editing !== 'new' ? editing : undefined}
        defaults={topic ? { topic } : undefined}
        existingIds={bank.questions.map((q) => q.id)}
        onSave={(q, prev) => {
          upsertQuestion(bank.bankId, q, prev);
          toast('Question saved', 'good');
        }}
      />

      <Modal open={!!trying} onClose={() => setTrying(null)} title="Preview (no rewards)" wide>
        {trying && <QuestionView question={{ ...trying, bankId: bank.bankId, uid: uidOf(bank.bankId, trying.id) }} onAnswered={() => {}} onNext={() => setTrying(null)} nextLabel="Close" />}
      </Modal>

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete question?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (toDelete) deleteQuestion(bank.bankId, toDelete.id);
                setToDelete(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        {toDelete && <ChemText as="p" text={toDelete.question} />}
      </Modal>
    </Card>
  );
}
