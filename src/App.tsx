import React, { useState, useEffect } from 'react';
import { CardTemplate, UnlockLicense, DraftCard } from './types/template';
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

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-body selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Bar adhering to the 3-Zone Contract */}
      <Navbar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
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
    </div>
  );
}
