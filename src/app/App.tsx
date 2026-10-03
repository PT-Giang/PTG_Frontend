import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import AuthRoute from './AuthRoute/AuthRoute';
import StudyRoute from './StudyRoute/StudyRoute';
import NotFound from './NotFound/NotFound';

const HomeDashboard = lazy(() => import('@/components/sites/www-thea-study-18140289/root-8a5edab2/HomeDashboard/HomeDashboard'));
const ProfilePage = lazy(() => import('@/components/sites/www-thea-study-18140289/profile-55d68502/ProfilePage/ProfilePage'));

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <Suspense fallback={<p role="status">Đang tải INS…</p>}>
    <Routes>
      <Route path="/" element={<><title>INS — Trang chủ</title><HomeDashboard /></>} />
      <Route path="/login" element={<AuthRoute mode="login" />} />
      <Route path="/register" element={<AuthRoute mode="register" />} />
      <Route path="/forgot-password" element={<AuthRoute mode="forgot" />} />
      <Route path="/profile" element={<><title>INS — Hồ sơ</title><ProfilePage /></>} />
      <Route path="/profile/edit" element={<><title>INS — Chỉnh sửa hồ sơ</title><ProfilePage view="edit" /></>} />
      <Route path="/profile/activity" element={<><title>INS — Thành tựu</title><ProfilePage view="activity" /></>} />
      {['study', 'smartStudy', 'studyGuides', 'summaries', 'podcasts', 'test'].map(view =>
        <Route key={view} path={`/${view}/:id`} element={<StudyRoute view={view} />} />)}
      <Route path="/memorize/:id/:mode" element={<StudyRoute view="memorize" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>;
}
