import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Waves, Grid, Radio, Lock, ArrowRight, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-margin-desktop">
      <div className="w-full max-w-6xl mx-auto my-auto py-space-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl shadow-xl overflow-hidden bg-surface-container-lowest border border-[#e2e8df]">
          
          {/* Left Panel: Precision Telemetry & Municipal Identity */}
          <div className="lg:col-span-7 bg-primary text-on-primary p-space-xl lg:p-space-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Background SVG Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern height="48" id="grid-pattern-login" patternUnits="userSpaceOnUse" width="48">
                    <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="24" cy="24" fill="currentColor" r="1.5" />
                  </pattern>
                </defs>
                <rect fill="url(#grid-pattern-login)" height="100%" width="100%" />
                <path d="M-100,200 C300,100 450,550 900,320" fill="none" stroke="currentColor" strokeDasharray="6,6" strokeWidth="2" />
              </svg>
            </div>

            {/* Top Brand Identity */}
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/15 p-2 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline text-xl font-bold tracking-tight text-white leading-tight">ClimateShield</span>
                    <span className="text-[10px] tracking-widest uppercase text-primary-fixed-dim font-semibold">Urban Climate Resilience</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-primary-container/80 px-3 py-1 rounded-full text-white text-xs border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse" />
                  <span className="font-semibold tracking-wider uppercase text-[10px]">MONITORING ACTIVE • NOMINAL</span>
                </div>
              </div>

              {/* Value Proposition */}
              <div className="mt-space-xl max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-container/90 text-white text-xs font-semibold uppercase tracking-wider mb-space-sm border border-white/10">
                  <Waves className="w-3.5 h-3.5" />
                  <span>Climate Risk Intelligence</span>
                </div>
                <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  Climate intelligence that drives action.
                </h1>
                <p className="mt-3 text-sm text-primary-fixed-dim leading-relaxed">
                  Monitor localized environmental risk, protect vulnerable infrastructure, and coordinate rapid municipal response workflows.
                </p>
              </div>

              {/* Tactical Gauge Strip */}
              <div className="mt-space-lg p-space-md rounded-lg bg-primary-container/50 backdrop-blur-sm flex items-center justify-between max-w-md border border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-primary-fixed-dim font-bold">Weather Ingestion</span>
                  <span className="font-headline font-bold text-lg text-white">Open-Meteo Synced</span>
                </div>
                <div className="w-28 h-6">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 144 32">
                    <path d="M0,24 Q24,6 48,18 T96,10 T144,14" fill="none" stroke="#7ed99e" strokeWidth="2.5" />
                    <circle cx="144" cy="14" fill="#ffffff" r="3.5" />
                  </svg>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-wider text-primary-fixed-dim font-bold">Hydrology Model</span>
                  <span className="text-xs font-bold text-primary-fixed">Basin Runoff</span>
                </div>
              </div>

              {/* 3 Core Capability Pillars */}
              <div className="mt-space-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-primary-container/40 rounded-lg p-3 flex flex-col gap-1 border border-white/10">
                  <Waves className="w-4 h-4 text-primary-fixed-dim" />
                  <span className="font-headline font-semibold text-xs text-white">Flood Modeling</span>
                  <span className="text-[11px] text-primary-fixed-dim leading-snug">Hydraulic basin simulation at 2m precision.</span>
                </div>
                <div className="bg-primary-container/40 rounded-lg p-3 flex flex-col gap-1 border border-white/10">
                  <Grid className="w-4 h-4 text-primary-fixed-dim" />
                  <span className="font-headline font-semibold text-xs text-white">Asset Vulnerability</span>
                  <span className="text-[11px] text-primary-fixed-dim leading-snug">Criticality index across transit &amp; hospitals.</span>
                </div>
                <div className="bg-primary-container/40 rounded-lg p-3 flex flex-col gap-1 border border-white/10">
                  <ShieldAlert className="w-4 h-4 text-primary-fixed-dim" />
                  <span className="font-headline font-semibold text-xs text-white">Dispatch Workflows</span>
                  <span className="text-[11px] text-primary-fixed-dim leading-snug">Rapid operational checklists and logs.</span>
                </div>
              </div>
            </div>

            {/* Authority Footer */}
            <div className="relative z-10 mt-space-xl pt-space-md border-t border-white/10 flex items-center justify-between text-primary-fixed-dim text-xs">
              <span>Trusted by Municipal Authorities</span>
              <span>ISO 22301 • GIS 4.3</span>
            </div>
          </div>

          {/* Right Panel: Authentication Terminal */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-space-xl lg:p-space-2xl flex flex-col justify-between">
            <div>
              {/* Header Status */}
              <div className="flex items-center justify-between pb-space-md border-b border-[#e2e8df]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-secondary font-bold">Operational Terminal</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-secondary-container text-xs font-semibold">
                  Node: US-EAST-04
                </span>
              </div>

              {/* Form Title */}
              <div className="mt-space-lg">
                <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Sign in to your ClimateShield operational workspace.
                </p>
              </div>

              {error && (
                <div className="mt-4 p-2.5 bg-error-container text-on-error-container rounded text-xs font-semibold border border-error/20">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form className="mt-space-md space-y-space-md" onSubmit={handleLogin}>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="work-email">
                    Official Work Email
                  </label>
                  <input
                    id="work-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-[#e2e8df] rounded text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="officer@municipal.gov"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="work-password">
                    Password / Access Key
                  </label>
                  <input
                    id="work-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-[#e2e8df] rounded text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-primary rounded cursor-pointer" />
                    <span>Remember terminal</span>
                  </label>
                  <span className="text-outline cursor-pointer hover:text-on-surface">Emergency Bypass</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 px-4 rounded text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? (
                    <span>Authenticating Node...</span>
                  ) : (
                    <>
                      <span>Access Operations Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-space-xl pt-space-md border-t border-[#e2e8df] text-center text-xs text-on-surface-variant">
              ClimateShield Disaster Mitigation &bull; Platform v2.4
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
