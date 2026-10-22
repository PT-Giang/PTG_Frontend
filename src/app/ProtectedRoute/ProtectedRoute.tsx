import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { authApi, type AuthUser } from "@/services/api";

export default function ProtectedRoute() {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        authApi.me().then((currentUser) => {
            if (isMounted) setUser(currentUser);
        })
            .catch(() => {
                if (isMounted) setUser(null);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            })
        return () => {
            isMounted = false;
        }
    }, [])
    // Trong lúc đợi kiểm tra, hiển thị loading
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p role="status">Đang kiểm tra đăng nhập... </p>
            </div>

        );
    }

    // Nếu không có user -> chuyển sang trang login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Nếu có user -> cho phép vào trang con
    return <Outlet />
}