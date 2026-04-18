import { useState, useEffect } from 'react';
import DocumentUpload from '../components/verification/DocumentUpload';
import CameraCapture from '../components/verification/CameraCapture';
import VerificationStatusBadge from '../components/verification/VerificationStatus';
import { verificationApi } from '../lib/api';

type Step = 'consent' | 'document' | 'face' | 'processing' | 'result';

const DOC_TYPES = [
  { value: 'passport', label: 'Passport', icon: '🛂', needsBack: false },
  { value: 'drivers_license', label: "Driver's License", icon: '🪪', needsBack: true },
  { value: 'aadhaar', label: 'Aadhaar Card', icon: '🇮🇳', needsBack: true },
  { value: 'pan_card', label: 'PAN Card', icon: '💳', needsBack: false },
  { value: 'national_id', label: 'National ID', icon: '🆔', needsBack: true },
];

const STEPS: { key: Step; label: string }[] = [
  { key: 'consent', label: 'Consent' },
  { key: 'document', label: 'Document' },
  { key: 'face', label: 'Face' },
  { key: 'processing', label: 'Processing' },
  { key: 'result', label: 'Result' },
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
  const [existingStatus, setExistingStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check existing verification status on mount
  useEffect(() => {
    (async () => {
      try {
        const status = await verificationApi.getMyStatus();
        if (status) {
          setExistingStatus(status);
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

  // Start session
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

  // Upload document
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

  // Capture face
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

  // Retry
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
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner} />
            <p style={styles.loadingText}>Checking verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const selectedDoc = DOC_TYPES.find((d) => d.value === docType);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🛡️ Identity Verification</h1>
          <p style={styles.headerSub}>Verify your identity to unlock all features</p>
        </div>

        {/* Step indicator */}
        <div style={styles.stepBar}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={styles.stepItem}>
              <div style={{
                ...styles.stepDot,
                ...(i <= stepIndex ? styles.stepDotActive : {}),
                ...(i < stepIndex ? styles.stepDotComplete : {}),
              }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span style={{
                ...styles.stepLabel,
                ...(i <= stepIndex ? styles.stepLabelActive : {}),
              }}>{s.label}</span>
              {i < STEPS.length - 1 && (
                <div style={{
                  ...styles.stepLine,
                  ...(i < stepIndex ? styles.stepLineActive : {}),
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Step: Consent */}
        {step === 'consent' && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Privacy Consent & ID Selection</h2>

            {/* ID Type selector */}
            <div style={styles.docTypeGrid}>
              {DOC_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  style={{
                    ...styles.docTypeCard,
                    ...(docType === dt.value ? styles.docTypeCardSelected : {}),
                  }}
                  onClick={() => setDocType(dt.value)}
                  aria-label={`Select ${dt.label}`}
                >
                  <span style={styles.docTypeIcon}>{dt.icon}</span>
                  <span style={styles.docTypeLabel}>{dt.label}</span>
                </button>
              ))}
            </div>

            {/* Consent disclosure */}
            <div style={styles.consentBox}>
              <h3 style={styles.consentTitle}>📋 Data Processing Disclosure</h3>
              {consentInfo?.disclosure ? (
                <ul style={styles.consentList}>
                  {consentInfo.disclosure.map((item: string, i: number) => (
                    <li key={i} style={styles.consentItem}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p style={styles.consentItem}>
                  Your biometric and identity data will be processed for verification purposes only.
                  Raw data is deleted after processing. You may request deletion at any time.
                </p>
              )}
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>I understand and consent to the processing of my data as described above.</span>
              </label>
            </div>

            <button
              style={{
                ...styles.primaryBtn,
                ...(!consentChecked || !docType || loading ? styles.btnDisabled : {}),
              }}
              disabled={!consentChecked || !docType || loading}
              onClick={handleStart}
            >
              {loading ? 'Starting...' : 'Begin Verification'}
            </button>
          </div>
        )}

        {/* Step: Document Upload */}
        {step === 'document' && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Upload Your {selectedDoc?.label || 'Document'}</h2>
            <p style={styles.stepSub}>
              Take a clear photo or scan of your document. Ensure all text is readable.
            </p>

            <DocumentUpload
              onUpload={handleDocumentUpload}
              requiresBack={selectedDoc?.needsBack || false}
              isUploading={loading}
            />

            {/* OCR Preview */}
            {ocrData && (
              <div style={styles.ocrPreview}>
                <h3 style={styles.ocrTitle}>📝 Extracted Information</h3>
                <div style={styles.ocrGrid}>
                  {ocrData.name && <div style={styles.ocrField}><span style={styles.ocrLabel}>Name</span><span>{ocrData.name}</span></div>}
                  {ocrData.dob && <div style={styles.ocrField}><span style={styles.ocrLabel}>Date of Birth</span><span>{ocrData.dob}</span></div>}
                  {ocrData.idNumber && <div style={styles.ocrField}><span style={styles.ocrLabel}>ID Number</span><span>{ocrData.idNumber}</span></div>}
                  {ocrData.expiry && <div style={styles.ocrField}><span style={styles.ocrLabel}>Expiry</span><span>{ocrData.expiry}</span></div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Face Capture */}
        {step === 'face' && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Face Verification</h2>
            <p style={styles.stepSub}>
              Complete the liveness challenges, then capture a clear selfie.
            </p>
            <CameraCapture onCapture={handleFaceCapture} isProcessing={loading} />
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div style={styles.stepContent}>
            <div style={styles.processingContainer}>
              <div style={styles.processingAnimation}>
                <div style={styles.processingRing} />
                <div style={styles.processingRing2} />
                <span style={styles.processingIcon}>🔍</span>
              </div>
              <h2 style={styles.processingTitle}>Verifying Your Identity</h2>
              <p style={styles.processingSub}>
                We're comparing your selfie with your document photo...
              </p>
              <div style={styles.processingSteps}>
                <div style={styles.processingStep}>✅ Document validated</div>
                <div style={styles.processingStep}>✅ Liveness check complete</div>
                <div style={{...styles.processingStep, color: '#8b5cf6'}}>⏳ Face matching in progress...</div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Result */}
        {step === 'result' && result && (
          <div style={styles.stepContent}>
            <div style={styles.resultContainer}>
              {(result.status === 'passed') && (
                <>
                  <div style={styles.resultIconSuccess}>✅</div>
                  <h2 style={styles.resultTitle}>Verification Successful!</h2>
                  <p style={styles.resultSub}>Your identity has been verified. You now have full access.</p>
                  <VerificationStatusBadge status="passed" size="lg" />
                  {result.confidence != null && (
                    <div style={styles.confidenceBadge}>
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </>
              )}

              {result.status === 'failed' && (
                <>
                  <div style={styles.resultIconFail}>❌</div>
                  <h2 style={styles.resultTitle}>Verification Failed</h2>
                  <p style={styles.resultSub}>
                    {result.failureReason || result.reason || 'Your identity could not be verified.'}
                  </p>
                  <VerificationStatusBadge status="failed" size="lg" />
                  <button style={styles.primaryBtn} onClick={handleRetry}>
                    🔄 Try Again
                  </button>
                </>
              )}

              {result.status === 'manual_review' && (
                <>
                  <div style={styles.resultIconReview}>👁️</div>
                  <h2 style={styles.resultTitle}>Under Manual Review</h2>
                  <p style={styles.resultSub}>
                    Your verification requires additional review. We'll notify you within 24 hours.
                  </p>
                  <VerificationStatusBadge status="manual_review" size="lg" />
                </>
              )}

              {result.status === 'locked' && (
                <>
                  <div style={styles.resultIconFail}>🔒</div>
                  <h2 style={styles.resultTitle}>Verification Locked</h2>
                  <p style={styles.resultSub}>
                    Maximum attempts exceeded. Please contact support for assistance.
                  </p>
                  <VerificationStatusBadge status="locked" size="lg" />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex', justifyContent: 'center',
    padding: '40px 16px', background: 'var(--bg-primary, #0f172a)',
  },
  card: {
    width: '100%', maxWidth: '640px',
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    padding: '32px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
    alignSelf: 'flex-start',
  },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { fontSize: '24px', fontWeight: 800, color: '#e2e8f0', margin: '0 0 6px' },
  headerSub: { fontSize: '14px', color: '#94a3b8', margin: 0 },
  stepBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0', marginBottom: '32px', flexWrap: 'wrap',
  },
  stepItem: {
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  stepDot: {
    width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700,
    background: 'rgba(148, 163, 184, 0.15)', color: '#64748b',
    transition: 'all 0.3s ease', flexShrink: 0,
  },
  stepDotActive: { background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' },
  stepDotComplete: { background: '#10b981', color: '#fff' },
  stepLabel: { fontSize: '11px', color: '#64748b', fontWeight: 500 },
  stepLabelActive: { color: '#e2e8f0' },
  stepLine: {
    width: '20px', height: '2px', background: 'rgba(148, 163, 184, 0.2)',
    margin: '0 4px', transition: 'all 0.3s ease',
  },
  stepLineActive: { background: '#10b981' },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px', color: '#ef4444', fontSize: '14px', marginBottom: '20px',
  },
  stepContent: { display: 'flex', flexDirection: 'column', gap: '20px' },
  stepTitle: { fontSize: '18px', fontWeight: 700, color: '#e2e8f0', margin: 0 },
  stepSub: { fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.5 },
  docTypeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px',
  },
  docTypeCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    padding: '16px 12px', background: 'rgba(148, 163, 184, 0.05)',
    border: '2px solid rgba(148, 163, 184, 0.1)', borderRadius: '14px',
    cursor: 'pointer', transition: 'all 0.3s ease', color: '#e2e8f0',
  },
  docTypeCardSelected: {
    borderColor: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)',
  },
  docTypeIcon: { fontSize: '28px' },
  docTypeLabel: { fontSize: '12px', fontWeight: 600, textAlign: 'center' },
  consentBox: {
    padding: '20px', background: 'rgba(139, 92, 246, 0.05)',
    border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '14px',
  },
  consentTitle: { fontSize: '15px', fontWeight: 600, color: '#e2e8f0', margin: '0 0 12px' },
  consentList: { margin: '0 0 16px', paddingLeft: '20px' },
  consentItem: { fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '4px' },
  checkboxLabel: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', fontWeight: 500,
  },
  checkbox: { marginTop: '2px', accentColor: '#8b5cf6' },
  primaryBtn: {
    padding: '14px 28px', fontSize: '15px', fontWeight: 600, color: '#fff',
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    border: 'none', borderRadius: '12px', cursor: 'pointer',
    transition: 'all 0.3s ease', alignSelf: 'center',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  ocrPreview: {
    padding: '16px', background: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '14px',
  },
  ocrTitle: { fontSize: '14px', fontWeight: 600, color: '#10b981', margin: '0 0 12px' },
  ocrGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  ocrField: { display: 'flex', flexDirection: 'column', gap: '2px' },
  ocrLabel: { fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  processingContainer: { textAlign: 'center', padding: '40px 0' },
  processingAnimation: { position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' },
  processingRing: {
    position: 'absolute', inset: 0, border: '3px solid rgba(139, 92, 246, 0.2)',
    borderTopColor: '#8b5cf6', borderRadius: '50%',
    animation: 'spin 1.5s linear infinite',
  },
  processingRing2: {
    position: 'absolute', inset: '10px', border: '3px solid rgba(16, 185, 129, 0.2)',
    borderBottomColor: '#10b981', borderRadius: '50%',
    animation: 'spin 2s linear infinite reverse',
  },
  processingIcon: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    fontSize: '36px',
  },
  processingTitle: { fontSize: '20px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' },
  processingSub: { fontSize: '14px', color: '#94a3b8', margin: '0 0 20px' },
  processingSteps: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' },
  processingStep: { fontSize: '13px', color: '#10b981', fontWeight: 500 },
  resultContainer: {
    textAlign: 'center', padding: '40px 0',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
  },
  resultIconSuccess: { fontSize: '64px' },
  resultIconFail: { fontSize: '64px' },
  resultIconReview: { fontSize: '64px' },
  resultTitle: { fontSize: '22px', fontWeight: 700, color: '#e2e8f0', margin: 0 },
  resultSub: { fontSize: '14px', color: '#94a3b8', maxWidth: '400px', lineHeight: 1.6, margin: 0 },
  confidenceBadge: {
    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
    color: '#10b981', background: 'rgba(16, 185, 129, 0.1)',
  },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '16px' },
  loadingSpinner: {
    width: '40px', height: '40px', border: '3px solid rgba(139, 92, 246, 0.2)',
    borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
  loadingText: { fontSize: '14px', color: '#94a3b8' },
};
