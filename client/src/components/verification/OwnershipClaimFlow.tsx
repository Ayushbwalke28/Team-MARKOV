import { useState } from 'react';
import { ownershipClaimApi } from '../../lib/api';
import DocumentUpload from './DocumentUpload';

interface OwnershipClaimFlowProps {
  claim: any;
  onRefresh: () => void;
}

type Method = 'domain_email' | 'business_document' | 'gst_registration' | 'admin_review' | '';

export default function OwnershipClaimFlow({ claim, onRefresh }: OwnershipClaimFlowProps) {
  const [method, setMethod] = useState<Method>(claim.verificationMethod || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // GST state
  const [gstin, setGstin] = useState('');
  const [cin, setCin] = useState('');

  const handleError = (err: any) => {
    setError(err.response?.data?.message || err.message || 'An error occurred');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await ownershipClaimApi.sendDomainOtp(claim.id, email);
      onRefresh();
    } catch (err: any) { handleError(err); } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await ownershipClaimApi.verifyDomainOtp(claim.id, otp);
      onRefresh();
    } catch (err: any) { handleError(err); } finally { setLoading(false); }
  };

  const handleDocumentUpload = async (front: File, back?: File) => {
    setLoading(true); setError(null);
    try {
      // In a real app we'd upload the file first to get a URL. 
      // For this demo, we'll create a fake URL.
      const fakeUrl = URL.createObjectURL(front);
      await ownershipClaimApi.uploadDocuments(claim.id, fakeUrl, back ? URL.createObjectURL(back) : undefined);
      onRefresh();
    } catch (err: any) { handleError(err); } finally { setLoading(false); }
  };

  const handleGstValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await ownershipClaimApi.validateGstin(claim.id, gstin, cin);
      onRefresh();
    } catch (err: any) { handleError(err); } finally { setLoading(false); }
  };

  const handleRequestAdminReview = async () => {
    setLoading(true); setError(null);
    try {
      await ownershipClaimApi.requestAdminReview(claim.id);
      onRefresh();
    } catch (err: any) { handleError(err); } finally { setLoading(false); }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw this claim?')) return;
    setLoading(true); setError(null);
    try {
      await ownershipClaimApi.withdraw(claim.id);
      onRefresh();
    } catch (err: any) { handleError(err); } finally { setLoading(false); }
  };

  if (claim.status === 'under_admin_review') {
    return (
      <div className="bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">👁️</span>
          <h3 className="font-bold text-lg">Under Admin Review</h3>
        </div>
        <p className="mb-4">Your claim requires manual review. We'll notify you within 48 hours.</p>
        <button onClick={handleWithdraw} className="text-sm underline hover:text-amber-800 dark:hover:text-amber-300">Withdraw Claim</button>
      </div>
    );
  }

  if (claim.status === 'rejected') {
    return (
      <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">❌</span>
          <h3 className="font-bold text-lg">Claim Rejected</h3>
        </div>
        <p className="mb-2">{claim.rejectionReason}</p>
        <p className="text-sm opacity-80">You can try again after the cooldown period.</p>
      </div>
    );
  }

  if (claim.status === 'approved') {
    return (
      <div className="bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">✅</span>
          <h3 className="font-bold text-lg">Ownership Verified</h3>
        </div>
        <p>Your ownership claim for {claim.company?.name} has been approved!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verify Ownership: {claim.company?.name}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Choose a method to prove you own or represent this company.</p>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {!method && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button onClick={() => setMethod('domain_email')} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">📧 Domain Email</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Quickest. Receive an OTP at an email ending in @{claim.company?.domain || 'company.com'}.</p>
          </button>
          
          <button onClick={() => setMethod('business_document')} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">📄 Business Document</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upload an authorization letter and government ID for AI review.</p>
          </button>
          
          <button onClick={() => setMethod('gst_registration')} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">🏛️ GST Validation</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Verify using your company's GSTIN (India only).</p>
          </button>
        </div>
      )}

      {method === 'domain_email' && (
        <div className="space-y-4">
          <button onClick={() => setMethod('')} className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">← Back to methods</button>
          
          {claim.status === 'domain_otp_sent' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-sm">
              <p className="text-slate-700 dark:text-slate-300">We sent a 6-digit OTP to <strong>{claim.domainEmail}</strong></p>
              <input type="text" placeholder="123456" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
              <button disabled={loading} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">Verify OTP</button>
            </form>
          ) : (
            <form onSubmit={handleSendOtp} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Email</label>
                <input type="email" placeholder={`e.g. founder@${claim.company?.domain || 'company.com'}`} required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
              </div>
              <button disabled={loading} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">Send Verification Code</button>
            </form>
          )}
        </div>
      )}

      {method === 'business_document' && (
        <div className="space-y-4">
          <button onClick={() => setMethod('')} className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">← Back to methods</button>
          <p className="text-slate-700 dark:text-slate-300">Please upload a signed Authorization Letter.</p>
          <DocumentUpload onUpload={handleDocumentUpload} requiresBack={false} isUploading={loading} />
        </div>
      )}

      {method === 'gst_registration' && (
        <div className="space-y-4 max-w-sm">
          <button onClick={() => setMethod('')} className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">← Back to methods</button>
          <form onSubmit={handleGstValidate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GSTIN</label>
              <input type="text" placeholder="15-character GSTIN" required value={gstin} onChange={e => setGstin(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CIN (Optional)</label>
              <input type="text" placeholder="Corporate Identity Number" value={cin} onChange={e => setCin(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
            </div>
            <button disabled={loading} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">Validate Registration</button>
          </form>
        </div>
      )}

      {/* Admin Fallback */}
      {method && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Having trouble verifying automatically? If you have provided evidence, you can escalate this claim to an administrator.</p>
          <div className="flex gap-4">
            <button disabled={loading} onClick={handleRequestAdminReview} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
              Request Admin Review
            </button>
            <button disabled={loading} onClick={handleWithdraw} className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              Withdraw Claim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
