import { useState, useEffect } from 'react';
import { companyApi, companyVerifyApi, investmentApi } from '../lib/api';

export default function CompanyDashboard() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  
  // Verification states
  const [verifyStatus, setVerifyStatus] = useState<any>(null);
  const [docUrl, setDocUrl] = useState('');

  // Investment states
  const [showInvestment, setShowInvestment] = useState(false);
  const [fundingStage, setFundingStage] = useState('Seed');
  const [askAmount, setAskAmount] = useState('');
  const [pitchDeckUrl, setPitchDeckUrl] = useState('');

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const data = await companyApi.getMyCompany();
      setCompany(data);
      if (data.verificationStatus === 'pending') {
        // Fetch session status if we have one
        try {
          const sessions = data.companyVerificationSessions;
          if (sessions && sessions.length > 0) {
            setVerifyStatus(sessions[0]);
          }
        } catch (e) {}
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Failed to fetch company details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await companyApi.create({ name, domain });
      await fetchCompany();
      setShowCreate(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create company');
    }
  };

  const handleStartVerification = async () => {
    try {
      const session = await companyVerifyApi.start(company.id);
      setVerifyStatus(session);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start verification');
    }
  };

  const handleUploadDoc = async () => {
    try {
      await companyVerifyApi.uploadDocument(verifyStatus.id, 'CIN', docUrl);
      const updated = await companyVerifyApi.getStatus(verifyStatus.id);
      setVerifyStatus(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleSubmitValidation = async () => {
    try {
      await companyVerifyApi.submitValidation(verifyStatus.id);
      await fetchCompany(); // Refresh everything
    } catch (err: any) {
      setError(err.response?.data?.message || 'Validation failed');
    }
  };

  const handleCreateInvestmentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await investmentApi.createCompanyProfile(company.id, {
        fundingStage,
        askAmount: parseFloat(askAmount),
        pitchDeckUrl,
      });
      alert('Investment Profile created successfully!');
      setShowInvestment(false);
      fetchCompany();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create profile');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading company data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">🏢 Company Hub</h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {!company ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 text-center shadow-sm dark:shadow-none">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">You don't have a company yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Create your company profile to unlock founder features and verification.</p>
          
          {!showCreate ? (
            <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm">
              Register Company
            </button>
          ) : (
            <form onSubmit={handleCreateCompany} className="max-w-md mx-auto text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Official Domain</label>
                <input type="text" required value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. yourstartup.com" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-sm">Create</button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Company Details Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{company.name}</h2>
                <p className="text-slate-500 dark:text-slate-400">{company.domain}</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                company.verificationStatus === 'verified' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                company.verificationStatus === 'rejected' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' :
                'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
              }`}>
                {company.verificationStatus === 'verified' ? '✓ Verified Business' :
                 company.verificationStatus === 'rejected' ? 'Verification Failed' : 'Pending Verification'}
              </div>
            </div>

            {/* Verification Flow */}
            {company.verificationStatus !== 'verified' && (
              <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Official Verification</h3>
                
                {!verifyStatus ? (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Start the verification process to get the Verified Badge and unlock investment tools.</p>
                    <button onClick={handleStartVerification} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                      Start Process
                    </button>
                  </div>
                ) : verifyStatus.status === 'pending' ? (
                  <div className="space-y-4">
                    <p className="text-slate-500 dark:text-slate-400">Upload your Certificate of Incorporation (CIN/EIN)</p>
                    <input type="text" placeholder="Document URL (mock)" value={docUrl} onChange={e => setDocUrl(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                    <button onClick={handleUploadDoc} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm">Upload Document</button>
                  </div>
                ) : verifyStatus.status === 'document_uploaded' ? (
                  <div className="space-y-4">
                    <p className="text-amber-600 dark:text-amber-400">Document uploaded. Ready for official registry validation.</p>
                    <button onClick={handleSubmitValidation} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-sm">
                      Run API Validation
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">Verification status: {verifyStatus.status}</p>
                )}
              </div>
            )}
          </div>

          {/* Investment Profile Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Investment Hub</h2>
            {company.verificationStatus !== 'verified' ? (
              <p className="text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 p-4 rounded-xl">
                ⚠️ Your company must be fully verified before you can seek investment and open Deal Rooms.
              </p>
            ) : !company.investmentProfile && !showInvestment ? (
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Set up an investment profile to allow verified investors to request access to your Deal Room.</p>
                <button onClick={() => setShowInvestment(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm">
                  Create Investment Profile
                </button>
              </div>
            ) : showInvestment ? (
              <form onSubmit={handleCreateInvestmentProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Funding Stage</label>
                  <select value={fundingStage} onChange={e => setFundingStage(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white">
                    <option>Pre-Seed</option>
                    <option>Seed</option>
                    <option>Series A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ask Amount ($)</label>
                  <input type="number" required value={askAmount} onChange={e => setAskAmount(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pitch Deck URL</label>
                  <input type="url" required value={pitchDeckUrl} onChange={e => setPitchDeckUrl(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 shadow-sm">Save Profile</button>
                  <button type="button" onClick={() => setShowInvestment(false)} className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                <p className="text-emerald-700 dark:text-emerald-400 font-medium">✅ Investment Profile Active</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Investors can now request Deal Room access.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
