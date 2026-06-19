import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import WorkPage from './pages/WorkPage.tsx';
import ServicesPage from './pages/ServicesPage.tsx';
import StudioPage from './pages/StudioPage.tsx';
import WebsiteDevelopmentPage from './pages/WebsiteDevelopmentPage.tsx';
import MobileApplicationsPage from './pages/MobileApplicationsPage.tsx';
import LogoDesignPage from './pages/LogoDesignPage.tsx';
import PosterDesignPage from './pages/PosterDesignPage.tsx';
import VideoEditingPage from './pages/VideoEditingPage.tsx';
import MotionGraphicsPage from './pages/MotionGraphicsPage.tsx';
import SEOPage from './pages/SEOPage.tsx';
import ThreeDAnimationPage from './pages/ThreeDAnimationPage.tsx';
import DigitalMarketingPage from './pages/DigitalMarketingPage.tsx';
import WebsiteAppMaintenancePage from './pages/WebsiteAppMaintenancePage.tsx';
import CyberSecuritySolutionsPage from './pages/CyberSecuritySolutionsPage.tsx';
import { ContactExperience } from './pages/ContactExperience.tsx';
import WorkDetailsPage from './pages/WorkDetailsPage.tsx';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminProjectEditor from './pages/admin/AdminProjectEditor';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminHomeCards from './pages/admin/AdminHomeCards';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSystemLogs from './pages/admin/AdminSystemLogs';
import { ProtectedRoute } from './components/admin/ProtectedRoute.tsx';
import { TransitionProvider } from './components/TransitionProvider.tsx';
import { Preloader } from './components/Preloader.tsx';
import './index.css';
import { logSystemEvent } from './lib/logger';

// Global Error Handling
window.onerror = (message, source, lineno, colno, error) => {
  logSystemEvent(
    `Uncaught Error: ${message}`,
    'frontend',
    'error',
    error || { stack: `${source}:${lineno}:${colno}` }
  );
};

window.onunhandledrejection = (event) => {
  logSystemEvent(
    `Unhandled Promise Rejection: ${event.reason}`,
    'frontend',
    'error',
    { stack: event.reason?.stack }
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TransitionProvider>
        <Preloader />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:id" element={<WorkDetailsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/website-development" element={<WebsiteDevelopmentPage />} />
          <Route path="/mobile-applications" element={<MobileApplicationsPage />} />
          <Route path="/logo-design" element={<LogoDesignPage />} />
          <Route path="/poster-design" element={<PosterDesignPage />} />
          <Route path="/video-editing" element={<VideoEditingPage />} />
          <Route path="/motion-graphics" element={<MotionGraphicsPage />} />
          <Route path="/seo" element={<SEOPage />} />
          <Route path="/3d-animation" element={<ThreeDAnimationPage />} />
          <Route path="/digital-marketing" element={<DigitalMarketingPage />} />
          <Route path="/website-and-app-maintenance" element={<WebsiteAppMaintenancePage />} />
          <Route path="/cyber-security-solutions" element={<CyberSecuritySolutionsPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/contact" element={<ContactExperience isOpen={true} onClose={() => window.history.back()} />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
          <Route path="/admin/projects/:id/edit" element={<ProtectedRoute><AdminProjectEditor /></ProtectedRoute>} />
          <Route path="/admin/home-cards" element={<ProtectedRoute><AdminHomeCards /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />

          <Route path="/admin/reviews" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/system-logs" element={<ProtectedRoute><AdminSystemLogs /></ProtectedRoute>} />
        </Routes>
      </TransitionProvider>
    </BrowserRouter>
  </StrictMode>,
);
