import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Suspense, lazy } from 'react';

// Pages (lazy loaded)
const Landing      = lazy(() => import('./pages/Landing'));
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const ForgotPass   = lazy(() => import('./pages/ForgotPassword'));
const Home         = lazy(() => import('./pages/Home'));
const Marketplace  = lazy(() => import('./pages/Marketplace'));
const CropDetail   = lazy(() => import('./pages/CropDetail'));
const AddCrop      = lazy(() => import('./pages/AddCrop'));
const EditCrop     = lazy(() => import('./pages/EditCrop'));
const FarmerDash   = lazy(() => import('./pages/FarmerDashboard'));
const BuyerDash    = lazy(() => import('./pages/BuyerDashboard'));
const MyListings   = lazy(() => import('./pages/MyListings'));
const Favorites    = lazy(() => import('./pages/Favorites'));
const Profile      = lazy(() => import('./pages/Profile'));
const Settings     = lazy(() => import('./pages/Settings'));
const LangSettings = lazy(() => import('./pages/LanguageSettings'));
const Help         = lazy(() => import('./pages/Help'));
const Notifications = lazy(() => import('./pages/Notifications'));

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading RythuConnect...</p>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/home" replace /> : children;
}

function RoleRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<ForgotPass />} />

            {/* Auth required */}
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/crops/:id" element={<CropDetail />} />

            <Route path="/add-crop" element={<PrivateRoute><RoleRoute role="farmer"><AddCrop /></RoleRoute></PrivateRoute>} />
            <Route path="/crops/:id/edit" element={<PrivateRoute><RoleRoute role="farmer"><EditCrop /></RoleRoute></PrivateRoute>} />
            <Route path="/my-listings" element={<PrivateRoute><RoleRoute role="farmer"><MyListings /></RoleRoute></PrivateRoute>} />
            <Route path="/farmer-dashboard" element={<PrivateRoute><RoleRoute role="farmer"><FarmerDash /></RoleRoute></PrivateRoute>} />
            <Route path="/buyer-dashboard" element={<PrivateRoute><RoleRoute role="buyer"><BuyerDash /></RoleRoute></PrivateRoute>} />

            <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />

            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/settings/language" element={<PrivateRoute><LangSettings /></PrivateRoute>} />

            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/help" element={<Help />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
