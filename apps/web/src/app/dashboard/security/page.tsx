'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppShell from '@/components/layout/AppShell';
import { useLanguage } from '@/context/LanguageContext';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? 'http://127.0.0.1:3006';

function MobileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#9C7E5A" strokeWidth="1.8">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C8773A" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9C7E5A" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type Step = 'qr' | 'verify' | 'disable-confirm';

interface TwoFAModalProps {
  step: Step;
  qrCode: string;
  secret: string;
  code: string;
  loading: boolean;
  error: string;
  t: Record<string, string>;
  onCodeChange: (v: string) => void;
  onVerify: () => void;
  onDisable: () => void;
  onClose: () => void;
}

function TwoFAModal({
  step, qrCode, secret, code, loading, error, t,
  onCodeChange, onVerify, onDisable, onClose,
}: TwoFAModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9C7E5A] hover:text-[#1A0F00]">
          <XIcon />
        </button>

        {step === 'qr' && (
          <>
            <div className="flex flex-col items-center mb-6">
              <ShieldIcon />
              <h2 className="text-[22px] font-bold text-[#1A0F00] mt-3 mb-1">{t.setupGoogleAuth}</h2>
              <p className="text-[13px] text-[#9C7E5A] text-center">{t.scanQrDesc}</p>
            </div>

            {qrCode && (
              <div className="flex justify-center mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="QR code for Google Authenticator" className="w-48 h-48 rounded-xl border border-[#EDE8DF]" />
              </div>
            )}

            <div className="bg-[#FAF7F2] rounded-xl border border-[#EDE8DF] px-4 py-3 mb-6 text-center">
              <p className="text-[11px] font-bold text-[#9C7E5A] tracking-widest uppercase mb-1">{t.manualEntryKey}</p>
              <p className="text-[13px] font-mono text-[#1A0F00] break-all select-all">{secret}</p>
            </div>

            <Button
              onClick={onVerify}
              className="w-full h-[48px] rounded-xl text-[15px] font-bold text-white border-0 hover:opacity-90"
              style={{ backgroundColor: '#2D1B00' }}
            >
              {t.scannedNext}
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="flex flex-col items-center mb-6">
              <ShieldIcon />
              <h2 className="text-[22px] font-bold text-[#1A0F00] mt-3 mb-1">{t.otpEnterCode}</h2>
              <p className="text-[13px] text-[#9C7E5A] text-center">{t.openAuthAppDesc}</p>
            </div>

            <div className="mb-4">
              <p className="text-[11px] font-bold text-[#9C7E5A] tracking-[0.1em] uppercase mb-2">{t.sixDigitCode}</p>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="rounded-xl border-[1.5px] border-[#D4C4A8] bg-[#FAF7F2] text-[18px] text-[#1A0F00] text-center tracking-[0.3em] focus-visible:ring-0 focus-visible:border-[#C8773A] h-[52px] px-4"
              />
              {error && <p className="text-[13px] text-red-500 mt-2">{error}</p>}
            </div>

            <Button
              onClick={onVerify}
              disabled={code.length !== 6 || loading}
              className="w-full h-[48px] rounded-xl text-[15px] font-bold text-white border-0 hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#2D1B00' }}
            >
              {loading ? t.verifyingText : t.enable2FA}
            </Button>
          </>
        )}

        {step === 'disable-confirm' && (
          <>
            <div className="flex flex-col items-center mb-6">
              <ShieldIcon />
              <h2 className="text-[22px] font-bold text-[#1A0F00] mt-3 mb-1">{t.disable2FALabel}</h2>
              <p className="text-[13px] text-[#9C7E5A] text-center">{t.disable2FADesc}</p>
            </div>

            <div className="mb-4">
              <p className="text-[11px] font-bold text-[#9C7E5A] tracking-[0.1em] uppercase mb-2">{t.sixDigitCode}</p>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="rounded-xl border-[1.5px] border-[#D4C4A8] bg-[#FAF7F2] text-[18px] text-[#1A0F00] text-center tracking-[0.3em] focus-visible:ring-0 focus-visible:border-[#C8773A] h-[52px] px-4"
              />
              {error && <p className="text-[13px] text-red-500 mt-2">{error}</p>}
            </div>

            <Button
              onClick={onDisable}
              disabled={code.length !== 6 || loading}
              className="w-full h-[48px] rounded-xl text-[15px] font-bold text-white border-0 hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#C8773A' }}
            >
              {loading ? t.disablingText : t.disable2FALabel}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface Session {
  id: string;
  deviceInfo?: string;
  ipAddress?: string;
  createdOn?: string;
}

export default function SecurityPage() {
  const { t } = useLanguage();
  const tt = t as unknown as Record<string, string>;

  const [userId, setUserId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [twoFactor, setTwoFactor] = useState(false);
  const [modalStep, setModalStep] = useState<Step | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [tfaLoading, setTfaLoading] = useState(false);
  const [tfaError, setTfaError] = useState('');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const loadSessions = (id: string) => {
    setSessionsLoading(true);
    fetch(`${AUTH_URL}/users/${id}/sessions`)
      .then((r) => r.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  };

  useEffect(() => {
    const stored = localStorage.getItem('devoteUser');
    if (!stored) return;
    const parsed = JSON.parse(stored);
    setUserId(parsed.id);
    setCurrentSessionId(localStorage.getItem('sessionId'));

    fetch(`${AUTH_URL}/users/${parsed.id}`)
      .then((r) => r.json())
      .then((user) => setTwoFactor(!!user.totpEnabled))
      .catch(() => {});

    loadSessions(parsed.id);
  }, []);

  const handleRevoke = async (sessionId: string) => {
    if (!userId) return;
    try {
      await fetch(`${AUTH_URL}/users/${userId}/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      // silently ignore
    }
  };

  const handlePasswordUpdate = async () => {
    if (!userId) return;
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: t.passwordMismatch });
      return;
    }
    setPwLoading(true);
    setPwMessage(null);
    try {
      const res = await fetch(`${AUTH_URL}/users/${userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? 'Failed to update password');
      }
      setPwMessage({ type: 'success', text: t.passwordUpdatedSuccess });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setPwLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!userId) return;

    if (!twoFactor) {
      setTfaError('');
      setCode('');
      setTfaLoading(true);
      try {
        const res = await fetch(`${AUTH_URL}/users/${userId}/2fa/setup`, { method: 'POST' });
        const data = await res.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setModalStep('qr');
      } catch {
        setTfaError('Failed to start 2FA setup. Please try again.');
      } finally {
        setTfaLoading(false);
      }
    } else {
      setCode('');
      setTfaError('');
      setModalStep('disable-confirm');
    }
  };

  const handleModalNext = () => {
    if (modalStep === 'qr') {
      setCode('');
      setTfaError('');
      setModalStep('verify');
    }
  };

  const handleVerify = async () => {
    if (!userId) return;
    setTfaLoading(true);
    setTfaError('');
    try {
      const res = await fetch(`${AUTH_URL}/users/${userId}/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? 'Invalid code');
      }
      setTwoFactor(true);
      setModalStep(null);
    } catch (err) {
      setTfaError((err as Error).message);
    } finally {
      setTfaLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!userId) return;
    setTfaLoading(true);
    setTfaError('');
    try {
      const res = await fetch(`${AUTH_URL}/users/${userId}/2fa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? 'Invalid code');
      }
      setTwoFactor(false);
      setModalStep(null);
    } catch (err) {
      setTfaError((err as Error).message);
    } finally {
      setTfaLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalStep(null);
    setCode('');
    setTfaError('');
    setQrCode('');
    setSecret('');
  };

  return (
    <AppShell title={t.securityManagement}>
      <div className="min-h-screen bg-[#F5F0E8]" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>
        <main className="px-8 py-6">
          <div className="grid grid-cols-2 gap-5 items-start">

            <div className="flex flex-col gap-5">

              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-[22px] font-bold text-[#1A0F00] mb-7">{t.changePassword}</h2>

                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-bold text-[#9C7E5A] tracking-[0.1em] uppercase mb-2">{t.currentPasswordLabel}</p>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="rounded-xl border-[1.5px] border-[#D4C4A8] bg-[#FAF7F2] text-[14px] text-[#1A0F00] focus-visible:ring-0 focus-visible:border-[#C8773A] h-[52px] px-4"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#9C7E5A] tracking-[0.1em] uppercase mb-2">{t.newPassword}</p>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-xl border-[1.5px] border-[#D4C4A8] bg-[#FAF7F2] text-[14px] text-[#1A0F00] focus-visible:ring-0 focus-visible:border-[#C8773A] h-[52px] px-4"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#9C7E5A] tracking-[0.1em] uppercase mb-2">{t.confirmNewPassword}</p>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="rounded-xl border-[1.5px] border-[#D4C4A8] bg-[#FAF7F2] text-[14px] text-[#1A0F00] focus-visible:ring-0 focus-visible:border-[#C8773A] h-[52px] px-4"
                    />
                  </div>
                </div>

                {pwMessage && (
                  <p className={`text-[13px] mt-4 ${pwMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {pwMessage.text}
                  </p>
                )}

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full mt-7 h-[52px] rounded-xl text-[15px] font-bold text-white border-0 hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#2D1B00' }}
                >
                  {pwLoading ? t.updatingText : t.updatePassword}
                </Button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-[22px] font-bold text-[#1A0F00] mb-5">{t.advancedSecurity}</h2>

                <div className="bg-[#FAF7F2] rounded-xl border border-[#EDE8DF] px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-[#1A0F00]">{t.twoFactorAuth}</p>
                    <p className="text-[13px] text-[#9C7E5A] mt-0.5">
                      {twoFactor ? t.twoFactorEnabled : t.twoFactorDisabled}
                    </p>
                  </div>

                  <button
                    onClick={handleToggle2FA}
                    disabled={tfaLoading}
                    className="relative w-[52px] h-[28px] rounded-full transition-colors duration-300 flex-shrink-0 disabled:opacity-60"
                    style={{ backgroundColor: twoFactor ? '#C8773A' : '#D4C4A8' }}
                  >
                    <span
                      className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-md transition-all duration-300"
                      style={{ left: twoFactor ? '26px' : '3px' }}
                    />
                  </button>
                </div>
              </div>

            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-[22px] font-bold text-[#1A0F00] mb-5">{t.activeSessions}</h2>

              {sessionsLoading ? (
                <p className="text-[13px] text-[#9C7E5A]">{t.loadingSessionsText}</p>
              ) : sessions.length === 0 ? (
                <p className="text-[13px] text-[#9C7E5A]">{t.noActiveSessions}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {sessions.map((session) => {
                    const isCurrent = session.id === currentSessionId;
                    const createdDate = session.createdOn
                      ? new Date(session.createdOn).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : t.unknownDevice;

                    return (
                      <div
                        key={session.id}
                        className="flex items-center justify-between bg-[#FAF7F2] rounded-xl border border-[#EDE8DF] px-5 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#EDE8DF] flex items-center justify-center flex-shrink-0">
                            <MobileIcon />
                          </div>
                          <div>
                            <p className="text-[15px] font-semibold text-[#1A0F00]">
                              {session.deviceInfo ?? t.unknownDevice}
                            </p>
                            <p className="text-[13px] text-[#9C7E5A] mt-0.5">
                              {session.ipAddress ?? t.unknownIP}
                            </p>
                            {isCurrent ? (
                              <p className="text-[13px] font-semibold text-[#2E7D32] mt-0.5">{t.currentSessionLabel}</p>
                            ) : (
                              <p className="text-[13px] text-[#9C7E5A] mt-0.5">{createdDate}</p>
                            )}
                          </div>
                        </div>

                        {!isCurrent && (
                          <Button
                            variant="outline"
                            onClick={() => handleRevoke(session.id)}
                            className="h-[36px] px-5 rounded-xl text-[13px] font-bold border-[1.5px] border-[#C8773A] text-[#C8773A] hover:bg-[#FFF5EE] bg-white transition-colors"
                          >
                            {t.revokeBtn}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>

        {modalStep && (
          <TwoFAModal
            step={modalStep}
            qrCode={qrCode}
            secret={secret}
            code={code}
            loading={tfaLoading}
            error={tfaError}
            t={tt}
            onCodeChange={setCode}
            onVerify={modalStep === 'qr' ? handleModalNext : handleVerify}
            onDisable={handleDisable}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </AppShell>
  );
}
