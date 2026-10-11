import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CommunityProvider } from './context/CommunityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { EmergencyBanner } from './components/emergency/EmergencyBanner';
import { ToastContainer } from './components/common/ToastContainer';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { SosModal } from './components/emergency/SosModal';
import { SafeCheckInModal } from './components/emergency/SafeCheckInModal';
import { AddResourceModal } from './components/resources/AddResourceModal';
import { NewMissionModal } from './components/volunteers/NewMissionModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileEditModal } from './components/auth/ProfileEditModal';
import { AiCommunityAssistantModal } from './components/assistant/AiCommunityAssistantModal';
import { Sparkles } from 'lucide-react';
import { useCommunity } from './context/CommunityContext';
import { ReportHazardModal } from './components/emergency/ReportHazardModal';
import { DeactivateEmergencyModal } from './components/emergency/DeactivateEmergencyModal';
import { OfflineSyncCenterModal } from './components/emergency/OfflineSyncCenterModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { VolunteersPage } from './pages/VolunteersPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { CommunityMapPage } from './pages/CommunityMapPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RequestsPage } from './pages/RequestsPage';
import { ReportsPage } from './pages/ReportsPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { 
    isSyncCenterOpen, 
    setIsSyncCenterOpen,
    isReportHazardModalOpen,
    setIsReportHazardModalOpen,
    isDeactivateModalOpen,
    setIsDeactivateModalOpen,
    confirmDeactivateEmergency
  } = useCommunity();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [safeCheckInModalOpen, setSafeCheckInModalOpen] = useState(false);
  const [addResourceModalOpen, setAddResourceModalOpen] = useState(false);
  const [newMissionModalOpen, setNewMissionModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);

  // Check if current route is the public landing page
  const isLandingRoute = location.pathname === '/' || location.pathname === '/landing';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors selection:bg-teal-500/20 selection:text-teal-600 dark:selection:text-teal-300">
      
      {/* Demo Mode / Local Persistence Banner */}
      <DemoModeBanner />

      {isLandingRoute ? (
        // Public Startup Landing Page
        <LandingPage onOpenVolunteerModal={() => setNewMissionModalOpen(true)} />
      ) : (
        // CommunityOS Application Shell
        <>
          {/* Top Banner (Activated automatically during disasters) */}
          <EmergencyBanner
            onOpenSos={() => setSosModalOpen(true)}
            onOpenSafeCheckIn={() => setSafeCheckInModalOpen(true)}
          />

          {/* Main Top Navbar */}
          <Navbar
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            onOpenSos={() => setSosModalOpen(true)}
            onOpenProfile={() => setProfileModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenAssistant={() => setAssistantModalOpen(true)}
          />

          {/* Layout Shell */}
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            {/* Collapsible / Desktop Sticky Sidebar */}
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <DashboardPage
                      onOpenSos={() => setSosModalOpen(true)}
                      onOpenSafeCheckIn={() => setSafeCheckInModalOpen(true)}
                      onOpenAddResource={() => setAddResourceModalOpen(true)}
                    />
                  }
                />
                <Route
                  path="/resources"
                  element={
                    <ResourcesPage
                      onOpenAddResource={() => setAddResourceModalOpen(true)}
                    />
                  }
                />
                <Route
                  path="/volunteers"
                  element={
                    <VolunteersPage
                      onOpenNewMission={() => setNewMissionModalOpen(true)}
                    />
                  }
                />
                <Route
                  path="/emergency"
                  element={
                    <EmergencyPage
                      onOpenSos={() => setSosModalOpen(true)}
                      onOpenSafeCheckIn={() => setSafeCheckInModalOpen(true)}
                    />
                  }
                />
                <Route
                  path="/map"
                  element={<CommunityMapPage />}
                />
                <Route
                  path="/requests"
                  element={<RequestsPage />}
                />
                <Route
                  path="/reports"
                  element={<ReportsPage />}
                />
                <Route
                  path="/announcements"
                  element={<AnnouncementsPage />}
                />
                <Route
                  path="/settings"
                  element={<SettingsPage />}
                />

                <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              {/* Footer inside main stream */}
              <Footer />
            </main>
          </div>
        </>
      )}

      {/* Global Modals */}
      <SosModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />

      <SafeCheckInModal
        isOpen={safeCheckInModalOpen}
        onClose={() => setSafeCheckInModalOpen(false)}
      />

      <AddResourceModal
        isOpen={addResourceModalOpen}
        onClose={() => setAddResourceModalOpen(false)}
      />

      <NewMissionModal
        isOpen={newMissionModalOpen}
        onClose={() => setNewMissionModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ProfileEditModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* AI Community Assistant Interactive Dialog */}
      <AiCommunityAssistantModal
        isOpen={assistantModalOpen}
        onClose={() => setAssistantModalOpen(false)}
      />

      {/* Floating AI Assistant Quick-Launch Button */}
      {!isLandingRoute && (
        <button
          onClick={() => setAssistantModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-2xl shadow-cyan-500/35 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 font-black text-xs ring-4 ring-white/20 dark:ring-slate-900/40 backdrop-blur-md cursor-pointer group"
          title="Ask Nexus AI Community Assistant"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-pulse text-white" />
          </div>
          <span className="hidden sm:inline tracking-tight font-extrabold">
            Ask Nexus AI
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping hidden sm:inline" />
        </button>
      )}

      {/* Offline Sync Center Modal */}
      <OfflineSyncCenterModal
        isOpen={isSyncCenterOpen}
        onClose={() => setIsSyncCenterOpen(false)}
      />

      {/* Community Hazard Report Modal */}
      <ReportHazardModal
        isOpen={isReportHazardModalOpen}
        onClose={() => setIsReportHazardModalOpen(false)}
      />

      {/* Emergency Deactivation Confirmation Modal */}
      <DeactivateEmergencyModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={confirmDeactivateEmergency}
      />

      {/* Floating Interactive Toast System */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <Router>
      <AuthProvider>
        <CommunityProvider>
          <AppContent />
        </CommunityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
