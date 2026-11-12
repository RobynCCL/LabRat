import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMode } from '@/modes/registry';
import { Button, EmptyState } from '@/components/ui';
import { Loader } from '@/components/Loader';
import { useI18n } from '@/i18n/useI18n';

/** Renders whichever registered mode matches #/play/:modeId. */
export default function ModeHost() {
  const { modeId } = useParams();
  const mode = modeId ? getMode(modeId) : undefined;
  const { t, c } = useI18n();
  if (!mode || mode.status !== 'ready' || !mode.component) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState icon="lock" title={mode ? t.play.isComingSoon(c.mode(mode).name) : t.play.notFound}>
          <p>{mode && c.mode(mode).description}</p>
          <Link to="/play">
            <Button className="mt-4" variant="secondary" icon="chevron-left">
              {t.play.backToModes}
            </Button>
          </Link>
        </EmptyState>
      </div>
    );
  }
  const C = mode.component;
  return (
    <Suspense fallback={<Loader inline />}>
      <C />
    </Suspense>
  );
}
