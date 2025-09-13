import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TechnicianListPage from './pages/technicians/TechnicianListPage';
import TechnicianDetailPage from './pages/technicians/TechnicianDetailPage';
import SessionPage from './pages/sessions/SessionPage';
import SessionDetailPage from './pages/sessions/SessionDetailPage'; // ← ADICIONADO
import ScheduleSessionPage from './pages/sessions/ScheduleSessionPage'; // ← ADICIONADO
import VideoCallPage from './pages/sessions/VideoCallPage';
import SubscriptionPage from './pages/subscriptions/SubscriptionPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Landing Pages (PÁGINAS EXISTENTES)
import ComoFuncionaPage from './pages/ComoFuncionaPage';
import EspecialidadesPage from './pages/EspecialidadesPage';
import PlanosPage from './pages/PlanosPage';
import ContatoPage from './pages/ContatoPage';

// NOVAS PÁGINAS CRIADAS
import SchedulePage from './pages/SchedulePage';
import CreditsPage from './pages/CreditsPage';
import SessionsPage from './pages/sessions/SessionPage';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              {/* ROTAS DAS PÁGINAS DA LANDING PAGE */}
              <Route path="como-funciona" element={<ComoFuncionaPage />} />
              <Route path="especialidades" element={<EspecialidadesPage />} />
              <Route path="planos" element={<PlanosPage />} />
              <Route path="contato" element={<ContatoPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Protected Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* ROTAS MODIFICADAS - Agora são "especialistas" ao invés de "técnicos" */}
              <Route path="specialists" element={<TechnicianListPage />} />
              <Route path="specialists/:id" element={<TechnicianDetailPage />} />
              
              {/* ==================== ROTAS DE SESSÕES COMPLETAS ==================== */}
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="sessions/:id" element={<SessionDetailPage />} /> {/* ← NOVA ROTA */}
              <Route path="sessions/schedule/:technicianId" element={<ScheduleSessionPage />} /> {/* ← NOVA ROTA */}
              
              {/* NOVAS ROTAS FUNCIONANDO */}
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="credits" element={<CreditsPage />} />
              
              {/* ROTAS EXISTENTES */}
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="profile" element={<ProfilePage />} />
              
              {/* COMPATIBILIDADE - Redirecionamentos para as rotas antigas */}
              <Route path="technicians" element={<Navigate to="/app/specialists" replace />} />
              <Route path="technicians/:id" element={<Navigate to="/app/specialists/:id" replace />} />
            </Route>

            {/* Video Call Route (Full Screen) */}
            <Route path="/call/:sessionId" element={
              <ProtectedRoute>
                <VideoCallPage />
              </ProtectedRoute>
            } />

            {/* Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
