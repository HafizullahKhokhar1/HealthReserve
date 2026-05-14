import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LandingPage, LoginPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AppointmentsPage } from './pages/Appointments';
import { HospitalsPage } from './pages/Hospitals';
import { DoctorProfileEdit } from './pages/DoctorProfileEdit';
import { DoctorPortfolioPage } from './pages/DoctorPortfolio';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastHost } from './components/ToastHost';
import { PatientProfileEdit } from './pages/PatientProfileEdit';
import { MedicalRecords } from './pages/MedicalRecords';
import { VideoConsultation } from './pages/VideoConsultation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatusBanner } from './components/NetworkStatus';
import { PrescriptionBuilder } from './pages/PrescriptionBuilder';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { FAQ } from './pages/FAQ';
import { FloatingChat } from './components/FloatingChat';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="container mx-auto max-w-full">
            {children}
          </div>
        </main>
        {user && <FloatingChat />}
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-500/20" />
          <p className="text-slate-400 font-bold tracking-tight">Syncing Health Data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/doctor/:username" element={<DoctorPortfolioPage />} />
        <Route path="/about" element={<><Header /><AboutUs /><Footer /></>} />
        <Route path="/contact" element={<><Header /><ContactUs /><Footer /></>} />
        <Route path="/privacy" element={<><Header /><PrivacyPolicy /><Footer /></>} />
        <Route path="/terms" element={<><Header /><TermsOfService /><Footer /></>} />
        <Route path="/faq" element={<><Header /><FAQ /><Footer /></>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <AuthenticatedLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/hospitals" element={<HospitalsPage />} />
        <Route path="/doctor-profile-edit" element={<DoctorProfileEdit />} />
        <Route path="/patient-profile-edit" element={<PatientProfileEdit />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/consultation/:appointmentId" element={<VideoConsultation />} />
        <Route path="/prescription-builder/:appointmentId" element={<PrescriptionBuilder />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthenticatedLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <Router>
          <NetworkStatusBanner />
        <ToastHost />
        <AppRoutes />
      </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
