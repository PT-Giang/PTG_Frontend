import { useSearchParams } from 'react-router';
import AuthLayout from '@/components/sites/www-thea-study-18140289/login-7e93fba0/AuthLayout/AuthLayout';
import AuthPanel from '@/components/sites/www-thea-study-18140289/login-7e93fba0/AuthPanel/AuthPanel';
interface AuthRouteProps { mode: 'login' | 'register' | 'forgot' }
export default function AuthRoute({ mode }: AuthRouteProps) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const title = mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Quên mật khẩu';
  return <AuthLayout><title>{`INS — ${title}`}</title><AuthPanel key={`${mode}:${email}`} mode={mode} initialEmail={email} /></AuthLayout>;
}
