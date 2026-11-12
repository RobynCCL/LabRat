import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/store/game';
import { Button, Card, Modal, PageHeader, Segmented, Toggle } from '@/components/ui';
import { downloadText } from '@/lib/exportPng';
import { toast } from '@/lib/events';
import { play } from '@/lib/sound';
import { toDay } from '@/engine/srs/leitner';

export default function SettingsScreen() {
  const settings = useGame((g) => g.save.settings);
  const { updateSettings, exportSave, importSave, resetSave } = useGame.getState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetText, setResetText] = useState('');
  const nav = useNavigate();

  const onImport = async (f: File) => {
    try {
      importSave(await f.text());
      toast('Save imported!', 'good');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'That file could not be imported.', 'bad');
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" icon="settings" />
      <div className="grid gap-4">
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-semibold">Profile</h2>
          <label className="label" htmlFor="pname">
            Name
          </label>
          <input id="pname" className="input max-w-sm" maxLength={24} value={settings.name} onChange={(e) => updateSettings({ name: e.target.value })} placeholder="Your name" />
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-lg font-semibold">Look &amp; feel</h2>
          <div className="grid gap-4">
            <div>
              <div className="label">Theme</div>
              <Segmented label="Theme" value={settings.theme} onChange={(v) => updateSettings({ theme: v })} options={[{ value: 'system', label: 'Match device' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
            </div>
            <div>
              <div className="label">Reduced motion</div>
              <Segmented
                label="Reduced motion"
                value={settings.reducedMotion}
                onChange={(v) => updateSettings({ reducedMotion: v })}
                options={[{ value: 'system', label: 'Match device' }, { value: 'on', label: 'Reduce motion' }, { value: 'off', label: 'Full motion' }]}
              />
              <p className="mt-1 text-sm text-muted">Turns off page transitions, animated items and celebrations.</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 text-lg font-semibold">Sound</h2>
          <Toggle label="Mute all sounds" checked={settings.muted} onChange={(v) => updateSettings({ muted: v })} />
          <div className="mt-2 flex items-center gap-3">
            <label className="label mb-0 w-20" htmlFor="vol">
              Volume
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
          <h2 className="mb-1 text-lg font-semibold">Your save</h2>
          <p className="mb-3 text-sm text-muted">Progress autosaves in this browser. Export a backup to move it to another device or keep it safe.</p>
          <div className="flex flex-wrap gap-2">
            <Button icon="download" onClick={() => downloadText(exportSave(), `lab-rat-save-${toDay()}.json`)}>
              Export save
            </Button>
            <Button variant="secondary" icon="upload" onClick={() => fileRef.current?.click()}>
              Import save
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
            <div className="font-semibold text-bad">Danger zone</div>
            <p className="text-sm text-muted">Delete all progress, Moles, items and imported question banks on this device.</p>
            <Button className="mt-2" variant="danger" size="sm" icon="trash" onClick={() => setConfirmReset(true)}>
              Reset everything
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-muted">Lab Rat v{__APP_VERSION__} · Works offline · No data leaves your device</p>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all progress?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={resetText.trim().toUpperCase() !== 'RESET'}
              onClick={async () => {
                await resetSave();
                setConfirmReset(false);
                setResetText('');
                nav('/');
              }}
            >
              Reset
            </Button>
          </>
        }
      >
        <p>This can't be undone. Consider exporting a backup first. Type <b>RESET</b> to confirm.</p>
        <input className="input mt-3" value={resetText} onChange={(e) => setResetText(e.target.value)} aria-label="Type RESET to confirm" />
      </Modal>
    </div>
  );
}
