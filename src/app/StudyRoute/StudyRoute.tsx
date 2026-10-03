import { lazy } from 'react';
import { useParams } from 'react-router';
import NotFound from '../NotFound/NotFound';
const StudyShell = lazy(() => import('@/components/sites/www-thea-study-18140289/study-29adad87/StudyShell/StudyShell'));
interface StudyRouteProps { view: string }
export default function StudyRoute({ view }: StudyRouteProps) {
  const { id, mode } = useParams();
  if (!id || (view === 'memorize' && mode !== 'list' && mode !== 'flashcards' && mode !== 'games')) return <NotFound />;
  const studyMode = mode === 'list' || mode === 'games' ? mode : 'flashcards';
  return <><title>{`INS — ${view === 'memorize' ? 'Thẻ ghi nhớ' : 'Học tập'}`}</title><StudyShell key={`${id}:${view}:${studyMode}`} materialId={id} view={view} mode={studyMode} /></>;
}
