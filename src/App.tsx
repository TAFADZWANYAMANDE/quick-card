import React, { useState, useEffect } from 'react';
import { CardTemplate, UnlockLicense, DraftCard, AppTheme } from './types/template';
import { STARTER_TEMPLATES } from './lib/templates';
import { getVerifiedUnlockState, loadSavedDrafts } from './lib/storage';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TemplateGallery } from './components/TemplateGallery';
import { HowSendingWorks } from './components/HowSendingWorks';
import { PricingSection } from './components/PricingSection';
import { OfflinePrivacySection } from './components/OfflinePrivacySection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CardStudio } from './components/studio/CardStudio';
import { UnlockModal } from './components/studio/UnlockModal';
import { ApkDownloadModal } from './components/studio/ApkDownloadModal';
import { SettingsModal } from './components/studio/SettingsModal';

export default function App() {
  const [activeView, setActiveView] = useState<'website' | 'studio'>('website');
  const [activeStudioTemplate, setActiveStudioTemplate] = useState<CardTemplate>(STARTER_TEMPLATES[0]);
  const [license, setLicense] = useState<UnlockLicense>({
    isUnlocked: false,
    tier: 'free',
    deviceId: 'QC-XXXX-YYYY',
  });
  const [savedDrafts, setSavedDrafts] = useState<DraftCard[]>([]);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [appTheme, setAppTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('quickcard_app_theme') as AppTheme) || 'dark-slate';
  });

  const handleThemeChange = (newTheme: AppTheme) => {
    setAppTheme(newTheme);
    localStorage.setItem('quickcard_app_theme', newTheme);
  };

  // Initialize license and drafts on mount
  useEffect(() => {
    const verifiedLicense = getVerifiedUnlockState();
    setLicense(verifiedLicense);
    const drafts = loadSavedDrafts();
    setSavedDrafts(drafts);
  }, []);

  const handleOpenStudio = (template?: CardTemplate) => {
    if (template) {
      setActiveStudioTemplate(template);
    }
    setActiveView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDataReset = () => {
    const resetLicense = getVerifiedUnlockState();
    setLicense(resetLicense);
    setSavedDrafts([]);
  };

  const THEME_CLASSES: Record<AppTheme, { bg: string; text: string; selection: string }> = {
    'dark-slate': { bg: 'bg-[#0F172A]', text: 'text-slate-100', selection: 'selection:bg-teal-500/30 selection:text-teal-200' },
    'pure-white': { bg: 'bg-[#F8FAFC]', text: 'text-slate-900', selection: 'selection:bg-teal-500/30 selection:text-teal-900' },
    'sky-blue': { bg: 'bg-[#F0F9FF]', text: 'text-sky-950', selection: 'selection:bg-sky-400/30 selection:text-sky-900' },
    'warm-linen': { bg: 'bg-[#FDFBF7]', text: 'text-stone-900', selection: 'selection:bg-amber-400/30 selection:text-amber-950' },
    'soft-mint': { bg: 'bg-[#F0FDF4]', text: 'text-emerald-950', selection: 'selection:bg-emerald-400/30 selection:text-emerald-950' },
    'rose-quartz': { bg: 'bg-[#FFF1F2]', text: 'text-rose-950', selection: 'selection:bg-rose-400/30 selection:text-rose-950' },
    'forest-emerald': { bg: 'bg-[#042F2E]', text: 'text-emerald-50', selection: 'selection:bg-emerald-500/30 selection:text-emerald-200' },
  };

  const currentThemeClass = THEME_CLASSES[appTheme] || THEME_CLASSES['dark-slate'];

  return (
    <div className={`min-h-screen ${currentThemeClass.bg} ${currentThemeClass.text} flex flex-col font-body ${currentThemeClass.selection} transition-colors duration-200`}>
      {/* Top Bar adhering to the 3-Zone Contract */}
      <Navbar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        license={license}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'website' ? (
          <div>
            {/* Hero Section */}
            <Hero
              onOpenStudio={handleOpenStudio}
              onOpenApkModal={() => setIsApkModalOpen(true)}
            />

            {/* 12 Templates Gallery */}
            <TemplateGallery onSelectTemplate={handleOpenStudio} />

            {/* How Sending Works & WhatsApp Consent Simulator */}
            <HowSendingWorks />

            {/* Fair Pricing & EcoCash System */}
            <PricingSection
              onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
              license={license}
            />

            {/* 100% Offline Architecture & Privacy Guarantee */}
            <OfflinePrivacySection onDataReset={handleDataReset} />

            {/* Frequently Asked Questions */}
            <FaqSection />
          </div>
        ) : (
          /* Interactive In-Browser Card Studio */
          <CardStudio
            initialTemplate={activeStudioTemplate}
            license={license}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onBackToWebsite={() => {
              setActiveView('website');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            savedDrafts={savedDrafts}
            onDraftsUpdated={setSavedDrafts}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <Footer
        onOpenStudio={() => handleOpenStudio()}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
      />

      {/* Global Modals */}
      <UnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        license={license}
        onLicenseUpdated={setLicense}
      />

      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        onLaunchStudio={() => handleOpenStudio()}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        appTheme={appTheme}
        onThemeChange={handleThemeChange}
        license={license}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
      />
    </div>
  );
}
