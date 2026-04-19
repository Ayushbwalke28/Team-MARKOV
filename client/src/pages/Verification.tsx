import { useState, useEffect } from 'react';
import DocumentUpload from '../components/verification/DocumentUpload';
import CameraCapture from '../components/verification/CameraCapture';
import VerificationStatusBadge from '../components/verification/VerificationStatus';
import { verificationApi } from '../lib/api';
import { ShieldCheck, Fingerprint, FileText, CheckCircle2, AlertCircle, Loader2, RefreshCw, ChevronRight, Scale, Clock, Lock } from 'lucide-react';

type Step = 'consent' | 'document' | 'face' | 'processing' | 'result';

const DOC_TYPES = [
  { value: 'passport', label: 'Passport', icon: '🛂', needsBack: false },
  { value: 'drivers_license', label: "Driver's License", icon: '🪪', needsBack: true },
  { value: 'aadhaar', label: 'Aadhaar Card', icon: '🇮🇳', needsBack: true },
  { value: 'pan_card', label: 'PAN Card', icon: '💳', needsBack: false },
  { value: 'national_id', label: 'National ID', icon: '🆔', needsBack: true },
];

const STEPS: { key: Step; label: string; icon: any }[] = [
  { key: 'consent', label: 'Consent', icon: Scale },
  { key: 'document', label: 'ID Document', icon: FileText },
  { key: 'face', label: 'Liveness', icon: Fingerprint },
  { key: 'processing', label: 'Verification', icon: ShieldCheck },
  { key: 'result', label: 'Complete', icon: CheckCircle2 },
];

export default function Verification() {
  const [step, setStep] = useState<Step>('consent');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [docType, setDocType] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [consentInfo, setConsentInfo] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const status = await verificationApi.getMyStatus();
        if (status) {
          if (['passed', 'locked'].includes(status.status)) {
            setResult(status);
            setStep('result');
          } else if (['manual_review'].includes(status.status)) {
            setResult(status);
            setStep('result');
          } else if (['document_uploaded', 'face_captured'].includes(status.status)) {
            setSessionId(status.id);
            setStep(status.status === 'document_uploaded' ? 'face' : 'processing');
          }
        }
      } catch { /* no existing session */ }
      try { setConsentInfo(await verificationApi.getConsentInfo()); } catch {}
      setCheckingStatus(false);
    })();
  }, []);

  const handleStart = async () => {
    if (!consentChecked || !docType) return;
    setError(null);
    setLoading(true);
    try {
      const session = await verificationApi.start();
      setSessionId(session.id);
      await verificationApi.recordConsent(session.id, true);
      setStep('document');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start verification');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (front: File, back?: File) => {
    if (!sessionId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await verificationApi.uploadDocument(sessionId, docType, front, back);
      setOcrData(res.ocrData);
      if (res.validation?.isValid) {
        setStep('face');
      } else {
        setError(res.validation?.issues?.join('. ') || 'Document validation failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Document upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceCapture = async (blob: Blob) => {
    if (!sessionId) return;
    setError(null);
    setLoading(true);
    setStep('processing');
    try {
      const res = await verificationApi.captureFace(sessionId, blob);
      setResult(res.result || res.session);
      setStep('result');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Face verification failed');
      setStep('face');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep('consent');
    setSessionId(null);
    setDocType('');
    setConsentChecked(false);
    setOcrData(null);
    setResult(null);
    setError(null);
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Initializing secure session...</p>
        </div>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const selectedDoc = DOC_TYPES.find((d) => d.value === docType);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Institutional Identity Verification
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Complete our high-trust verification process to unlock full platform capabilities and professional features.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-8 overflow-hidden">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 transition-all duration-500 ease-in-out z-0" 
              style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i <= stepIndex;
              const isCurrent = i === stepIndex;
              return (
                <div key={s.key} className="relative z-10 flex flex-col items-center group">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-400'}
                    ${isCurrent ? 'ring-4 ring-indigo-50 dark:ring-indigo-900/20 scale-110' : ''}
                  `}>
                    {i < stepIndex ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`
                    absolute top-12 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors
                    ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}
                  `}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border-b border-red-100 dark:border-red-500/20 p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-sm font-medium text-red-600 dark:text-red-500">{error}</p>
            </div>
          )}

          <div className="p-8 sm:p-10">
            {/* Step: Consent */}
            {step === 'consent' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select Your Document Type</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Choose the official document you will use for verification.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DOC_TYPES.map((dt) => (
                    <button
                      key={dt.value}
                      onClick={() => setDocType(dt.value)}
                      className={`
                        flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left
                        ${docType === dt.value 
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 ring-1 ring-indigo-600' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-900'}
                      `}
                    >
                      <span className="text-2xl">{dt.icon}</span>
                      <div>
                        <p className={`font-bold text-sm ${docType === dt.value ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {dt.label}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Official ID</p>
                      </div>
                      {docType === dt.value && <CheckCircle2 className="ml-auto text-indigo-600" size={18} />}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Scale className="text-indigo-600" size={18} />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Data Processing Disclosure</h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {consentInfo?.disclosure ? (
                      consentInfo.disclosure.map((item: string, i: number) => (
                        <div key={i} className="flex gap-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          <span className="text-indigo-600 font-bold">•</span>
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Your biometric and identity data will be processed for verification purposes only.
                        Raw data is deleted after processing. You may request deletion at any time.
                      </p>
                    )}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-700 checked:bg-indigo-600 transition-all"
                      />
                      <CheckCircle2 className="absolute h-5 w-5 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" size={14} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      I understand and consent to the processing of my biometric and identity data as described above.
                    </span>
                  </label>
                </div>

                <button
                  disabled={!consentChecked || !docType || loading}
                  onClick={handleStart}
                  className={`
                    w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2
                    ${!consentChecked || !docType || loading 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'}
                  `}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                  Begin Secure Verification
                </button>
              </div>
            )}

            {/* Step: Document Upload */}
            {step === 'document' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Your {selectedDoc?.label}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ensure the document is well-lit and all details are clearly visible.</p>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                  <DocumentUpload
                    onUpload={handleDocumentUpload}
                    requiresBack={selectedDoc?.needsBack || false}
                    isUploading={loading}
                  />
                </div>

                {ocrData && (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-500/20">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                      <CheckCircle2 size={12} /> Automatically Extracted Data
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {ocrData.name && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{ocrData.name}</p>
                        </div>
                      )}
                      {ocrData.idNumber && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Document Number</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{ocrData.idNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Face Capture */}
            {step === 'face' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Biometric Verification</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Position your face in the frame and follow the liveness instructions.</p>
                </div>
                <div className="overflow-hidden rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                  <CameraCapture onCapture={handleFaceCapture} isProcessing={loading} />
                </div>
              </div>
            )}

            {/* Step: Processing */}
            {step === 'processing' && (
              <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full" />
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="text-indigo-600 animate-pulse" size={48} />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">AI Identity Validation</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    We're securely comparing your biometric data with your official identification document...
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="text-emerald-500" size={16} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Document integrity verified</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="text-emerald-500" size={16} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Liveness check passed</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                    <Loader2 className="text-indigo-600 animate-spin" size={16} />
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Performing face matching...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Result */}
            {step === 'result' && result && (
              <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-700">
                {result.status === 'passed' && (
                  <div className="space-y-8">
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 size={56} className="animate-in zoom-in duration-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Verification Passed</h2>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Your identity has been cryptographically verified. You now have full access to the platform.
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      <VerificationStatusBadge status="passed" size="lg" />
                      {result.confidence != null && (
                        <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest rounded-full">
                          Trust Confidence: {(result.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.status === 'failed' && (
                  <div className="space-y-8">
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-600">
                      <AlertCircle size={56} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Verification Failed</h2>
                      <p className="text-red-600 dark:text-red-500 font-medium">
                        {result.failureReason || result.reason || 'Your identity could not be verified.'}
                      </p>
                    </div>
                    <VerificationStatusBadge status="failed" size="lg" />
                    <button 
                      onClick={handleRetry}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                      <RefreshCw size={18} /> Restart Verification
                    </button>
                  </div>
                )}

                {result.status === 'manual_review' && (
                  <div className="space-y-8">
                    <div className="w-24 h-24 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-600">
                      <Clock size={56} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Manual Review Required</h2>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Your verification requires additional review by our compliance team. We'll notify you within 24 hours.
                      </p>
                    </div>
                    <VerificationStatusBadge status="manual_review" size="lg" />
                  </div>
                )}

                {result.status === 'locked' && (
                  <div className="space-y-8">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600 dark:text-slate-400">
                      <Lock size={56} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Account Locked</h2>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Maximum verification attempts exceeded. Please contact institutional support for further assistance.
                      </p>
                    </div>
                    <VerificationStatusBadge status="locked" size="lg" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer Info */}
          <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Lock size={12} /> 256-bit AES Encryption
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={12} /> GDPR Compliant
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Scale size={12} /> Regulatory Verified
            </div>
          </div>
        </div>

        {/* Support Link */}
        <div className="text-center mt-10">
          <p className="text-xs text-slate-400">
            Need help? <a href="#" className="text-indigo-600 font-bold hover:underline">Contact Institutional Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
