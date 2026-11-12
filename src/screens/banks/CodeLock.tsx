import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/store/game';
import { Button, Icon, Modal } from '@/components/ui';
import { useI18n } from '@/i18n/useI18n';
import { toast } from '@/lib/events';
import { play } from '@/lib/sound';

/** Asks for the bank-editing code. Calls onUnlocked when it's right. */
export function CodeModal({ open, onClose, onUnlocked }: { open: boolean; onClose: () => void; onUnlocked?: () => void }) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const shake = useAnimationControls();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCode('');
      setWrong(false);
    }
  }, [open]);

  const submit = () => {
    if (useGame.getState().unlockBanks(code)) {
      play('correct');
      toast(t.lock.unlocked, 'good');
      onClose();
      onUnlocked?.();
    } else {
      play('error');
      setWrong(true);
      setCode('');
      void shake.start({ x: [0, -10, 10, -8, 8, 0], transition: { duration: 0.35 } });
      inputRef.current?.focus();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.lock.enterCode}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button icon="lock" onClick={submit} disabled={!code.trim()}>
            {t.lock.unlock}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-muted">{t.lock.body}</p>
      <motion.label className="block" animate={shake}>
        <span className="label">{t.lock.code}</span>
        <input
          ref={inputRef}
          className={`input h-12 max-w-[12rem] text-center font-mono text-2xl tracking-[0.4em] ${wrong ? 'border-bad ring-2 ring-bad/30' : ''}`}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={12}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ''));
            setWrong(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && code.trim() && submit()}
        />
      </motion.label>
      {wrong && (
        <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-bad" role="alert">
          <Icon name="x" size={16} strokeWidth={3} /> {t.lock.wrong}
        </p>
      )}
    </Modal>
  );
}

/** Banner shown on the Question banks screen: locked → "Unlock"; unlocked → "Lock". */
export function LockBanner({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useI18n();
  const unlocked = useGame((g) => g.banksUnlocked);
  if (unlocked) {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          icon="lock"
          onClick={() => {
            useGame.getState().lockBanks();
            toast(t.lock.locked);
          }}
        >
          {t.lock.lock}
        </Button>
      </div>
    );
  }
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-2 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-muted">
        <Icon name="lock" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{t.lock.title}</div>
        <div className="text-sm text-muted">{t.lock.body}</div>
      </div>
      <Button icon="lock" onClick={onUnlock}>
        {t.lock.unlock}
      </Button>
    </div>
  );
}
