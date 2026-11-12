import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/store/game';
import { Button, Card, Modal, PageHeader, Segmented, Toggle } from '@/components/ui';
import { LanguageToggle } from '@/components/LanguageToggle';
import { downloadText } from '@/lib/exportPng';
import { toast } from '@/lib/events';
import { play } from '@/lib/sound';
import { toDay } from '@/engine/srs/leitner';
import { SaveFormatError } from '@/store/migrations';
import { useI18n } from '@/i18n/useI18n';
import type { QuestionLanguage } from '@/store/saveTypes';

export default function SettingsScreen() {
  const settings = useGame((g) => g.save.settings);
  const { updateSettings, exportSave, importSave, resetSave } = useGame.getState();
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetText, setResetText] = useState('');
  const nav = useNavigate();

  const onImport = async (f: File) => {
    try {
      importSave(await f.text());
      toast(t.settings.imported, 'good');
    } catch (e) {
      toast(e instanceof SaveFormatError ? t.settings.saveErrors[e.code] : t.settings.importFailed, 'bad');
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.settings.title} icon="settings" />
      <div className="grid gap-4">
        <Card className="p-5">
          <h2 className="mb-1 text-lg font-semibold">{t.settings.language}</h2>
          <p className="mb-3 text-sm text-muted">{t.settings.languageHelp}</p>
          <LanguageToggle />
          <div className="mt-5">
            <div className="label">{t.settings.questionLanguage}</div>
            <Segmented<QuestionLanguage>
              label={t.settings.questionLanguage}
              value={settings.questionLanguage}
              onChange={(v) => updateSettings({ questionLanguage: v })}
              options={(['auto', 'en', 'ga', 'both'] as const).map((v) => ({ value: v, label: t.settings.qlang[v] }))}
            />
            <p className="mt-1 text-sm text-muted">{t.settings.questionLanguageHelp}</p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-lg font-semibold">{t.settings.profile}</h2>
          <label className="label" htmlFor="pname">
            {t.settings.name}
          </label>
          <input id="pname" className="input max-w-sm" maxLength={24} value={settings.name} onChange={(e) => updateSettings({ name: e.target.value })} placeholder={t.settings.namePlaceholder} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-lg font-semibold">{t.settings.lookFeel}</h2>
          <div className="grid gap-4">
            <div>
              <div className="label">{t.settings.theme}</div>
              <Segmented
                label={t.settings.theme}
                value={settings.theme}
                onChange={(v) => updateSettings({ theme: v })}
                options={[
                  { value: 'system', label: t.settings.matchDevice },
                  { value: 'light', label: t.settings.light },
                  { value: 'dark', label: t.settings.dark },
                ]}
              />
            </div>
            <div>
              <div className="label">{t.settings.reducedMotion}</div>
              <Segmented
                label={t.settings.reducedMotion}
                value={settings.reducedMotion}
                onChange={(v) => updateSettings({ reducedMotion: v })}
                options={[
                  { value: 'system', label: t.settings.matchDevice },
                  { value: 'on', label: t.settings.reduce },
                  { value: 'off', label: t.settings.full },
                ]}
              />
              <p className="mt-1 text-sm text-muted">{t.settings.motionHelp}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 text-lg font-semibold">{t.settings.sound}</h2>
          <Toggle label={t.settings.mute} checked={settings.muted} onChange={(v) => updateSettings({ muted: v })} />
          <div className="mt-2 flex items-center gap-3">
            <label className="label mb-0 w-20" htmlFor="vol">
              {t.settings.volume}
            </label>
            <input
              id="vol"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              disabled={settings.muted}
              className="flex-1 accent-[rgb(var(--primary))]"
              onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
              onPointerUp={() => play('coin')}
            />
            <span className="w-10 text-right text-sm num">{Math.round(settings.volume * 100)}%</span>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 text-lg font-semibold">{t.settings.yourSave}</h2>
          <p className="mb-3 text-sm text-muted">{t.settings.saveHelp}</p>
          <div className="flex flex-wrap gap-2">
            <Button icon="download" onClick={() => downloadText(exportSave(), `lab-rat-save-${toDay()}.json`)}>
              {t.settings.exportSave}
            </Button>
            <Button variant="secondary" icon="upload" onClick={() => fileRef.current?.click()}>
              {t.settings.importSave}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = '';
              }}
            />
          </div>
          <div className="mt-6 rounded-xl border border-bad/40 p-4">
            <div className="font-semibold text-bad">{t.settings.danger}</div>
            <p className="text-sm text-muted">{t.settings.dangerBody}</p>
            <Button className="mt-2" variant="danger" size="sm" icon="trash" onClick={() => setConfirmReset(true)}>
              {t.settings.reset}
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-muted">{t.settings.footer(__APP_VERSION__)}</p>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={t.settings.resetTitle}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="danger"
              disabled={resetText.trim().toUpperCase() !== t.settings.resetWord}
              onClick={async () => {
                await resetSave();
                setConfirmReset(false);
                setResetText('');
                nav('/');
              }}
            >
              {t.settings.resetButton}
            </Button>
          </>
        }
      >
        <p>{t.settings.resetBody(t.settings.resetWord)}</p>
        <input className="input mt-3" value={resetText} onChange={(e) => setResetText(e.target.value)} aria-label={t.settings.resetAria(t.settings.resetWord)} />
      </Modal>
    </div>
  );
}
