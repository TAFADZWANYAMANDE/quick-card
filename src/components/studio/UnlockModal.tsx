import React, { useState } from 'react';
import { UnlockLicense } from '../../types/template';
import { saveUnlockCode, resetUnlockState } from '../../lib/storage';
import { generateSellerUnlockCode, QUICKCARD_PUBLIC_KEY_HEX } from '../../lib/cryptoUnlock';
import { X, Key, ShieldCheck, Copy, Check, Terminal, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: UnlockLicense;
  onLicenseUpdated: (newLicense: UnlockLicense) => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  license,
  onLicenseUpdated,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedDevId, setCopiedDevId] = useState(false);
  const [showSellerTool, setShowSellerTool] = useState(false);
  const [sellerTier, setSellerTier] = useState<'unlocked' | 'event_pass'>('unlocked');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyDevId = () => {
    navigator.clipboard.writeText(license.deviceId);
    setCopiedDevId(true);
    setTimeout(() => setCopiedDevId(false), 2000);
  };

  const handleVerify = () => {
    if (!inputCode.trim()) {
      setFeedback({ success: false, message: 'Please enter a code to verify' });
      return;
    }

    const res = saveUnlockCode(inputCode.trim());
    setFeedback({ success: res.success, message: res.message });
    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
      onLicenseUpdated(res.license);
    }
  };

  const handleReset = () => {
    const updated = resetUnlockState();
    onLicenseUpdated(updated);
    setFeedback({ success: false, message: 'License reset back to Free tier.' });
  };

  const handleGenerateSellerCode = () => {
    const code = generateSellerUnlockCode(license.deviceId, sellerTier);
    setGeneratedCode(code);
    setInputCode(code);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E293B] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#334155] relative my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1 font-body">
            <span>Cryptographic Offline Stamp</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-amber-400">Ed25519 (tweetnacl)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
            QuickCard License & Unlock
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-body">
            No server or internet call is made. Verification uses the built-in public key.
          </p>
        </div>

        {/* Current Device ID Box */}
        <div className="p-4 bg-[#0F172A] border border-[#334155] rounded-2xl mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1 font-body">
            Your Phone’s Unique Device ID
          </span>
          <div className="flex items-center justify-between gap-3">
            <code className="text-base sm:text-lg font-bold font-mono text-teal-300">
              {license.deviceId}
            </code>
            <button
              onClick={handleCopyDevId}
              className="min-h-[44px] px-3.5 py-1.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-medium border border-[#334155] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedDevId ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedDevId ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>
        </div>

        {/* Status display */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-3.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${license.isUnlocked ? 'text-teal-400' : 'text-slate-500'}`} />
              <span className="font-semibold text-slate-200">
                Current Status: {license.isUnlocked ? (license.tier === 'unlocked' ? 'Pro Lifetime ($2)' : 'Pro Event Pass ($1.50)') : 'Free Plan (Upgrade to Pro for $2)'}
              </span>
            </div>

            {license.isUnlocked && (
              <button
                onClick={handleReset}
                className="text-[11px] text-rose-400 hover:underline font-medium cursor-pointer"
              >
                Reset to Free
              </button>
            )}
          </div>
        </div>

        {/* Unlock Code Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 font-body">
              Paste Signed Unlock Code
            </label>
            <textarea
              rows={3}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-teal-500 transition-all break-all placeholder:text-slate-500"
              placeholder="Paste the payload.signature code received from seller..."
            />
          </div>

          <button
            onClick={handleVerify}
            className="w-full min-h-[48px] py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-body"
          >
            <Key className="w-4 h-4" />
            <span>Verify Offline Signature</span>
          </button>

          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                feedback.success
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/40'
                  : 'bg-rose-950/60 text-rose-200 border border-rose-500/40'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Seller Laptop Signing Simulation Tool */}
        <div className="pt-4 border-t border-[#334155]">
          <button
            onClick={() => setShowSellerTool(!showSellerTool)}
            className="w-full min-h-[44px] flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white py-1 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span>Seller Laptop Script Simulation (Developer / Evaluation Tool)</span>
            </span>
            <span className="text-[11px] text-teal-400 font-mono">{showSellerTool ? 'Hide' : 'Show Tool'}</span>
          </button>

          {showSellerTool && (
            <div className="mt-3 p-4 bg-[#0F172A] text-slate-200 rounded-2xl text-xs space-y-3 font-mono border border-[#334155]">
              <div className="text-[11px] text-teal-400">
                # Simulates the seller’s offline laptop script that signs customer Device IDs with Ed25519 private key.
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Target Device:</span>
                <span className="text-amber-300 font-bold">{license.deviceId}</span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sellerTier"
                    checked={sellerTier === 'unlocked'}
                    onChange={() => setSellerTier('unlocked')}
                  />
                  <span>Lifetime ($2)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sellerTier"
                    checked={sellerTier === 'event_pass'}
                    onChange={() => setSellerTier('event_pass')}
                  />
                  <span>Event Pass ($1.50)</span>
                </label>
              </div>

              <button
                onClick={handleGenerateSellerCode}
                className="w-full min-h-[44px] py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all cursor-pointer font-sans"
              >
                Sign with Seller Private Key & Populate Code
              </button>

              {generatedCode && (
                <div className="pt-2 text-[10px] text-slate-300 break-all bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-teal-400 mb-1">Generated Authentic Code:</div>
                  {generatedCode}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
