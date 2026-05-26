import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "./Spinner/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Coach' | 'Athlete')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;