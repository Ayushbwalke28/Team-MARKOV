import { useState, useEffect } from 'react';
import { aiApi, companyApi, companyVerifyApi, investmentApi, ownershipClaimApi } from '../lib/api';
import OwnershipClaimFlow from '../components/verification/OwnershipClaimFlow';
import { Sparkles, Megaphone, Send, Loader2} from 'lucide-react';

export default function CompanyDashboard() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Claim states
  const [activeClaim, setActiveClaim] = useState<any>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  // Form states
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  
  // Verification states
  const [verifyStatus, setVerifyStatus] = useState<any>(null);
  const [docUrl, setDocUrl] = useState('');
  const [gstin, setGstin] = useState('');
  const [cinNumber, setCinNumber] = useState('');
  const [isStartingVerify, setIsStartingVerify] = useState(false);

  // Investment states
  const [showInvestment, setShowInvestment] = useState(false);
  const [fundingStage, setFundingStage] = useState('Seed');
  const [askAmount, setAskAmount] = useState('');
  const [pitchDeckUrl, setPitchDeckUrl] = useState('');

  // Trust & Funding states
  const [trustProfile, setTrustProfile] = useState<any>(null);
  const [showFundingForm, setShowFundingForm] = useState(false);
  const [newFundingStage, setNewFundingStage] = useState('Pre-Seed');
  const [newFundingAmount, setNewFundingAmount] = useState('');
  const [newFundingDate, setNewFundingDate] = useState('');
  const [newFundingInvestors, setNewFundingInvestors] = useState('');

  // AI Campaign states
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [campaignGoal, setCampaignGoal] = useState('Announce our product launch');
  const [campaignResults, setCampaignResults] = useState<any>(null);

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
      } else if (data.verificationStatus === 'verified') {
        try {
          const trustData = await companyApi.getTrustProfile(data.id);
          setTrustProfile(trustData);
        } catch (e) {}
      }

      // If no company, check for active claims
      if (!data) {
        const claims = await ownershipClaimApi.getMyClaims();
        if (claims && claims.length > 0) {
          // Find first active claim
          setActiveClaim(claims[0]);
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Failed to fetch company details');
      } else {
        // If 404, we don't have a company. Fetch claims.
        try {
          const claims = await ownershipClaimApi.getMyClaims();
          if (claims && claims.length > 0) {
            setActiveClaim(claims[0]);
          }
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    try {
      await ownershipClaimApi.create(selectedCompanyId, 'owner');
      await fetchCompany();
      setShowClaimForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start claim');
    }
  };

  const handleLoadCompanies = async () => {
    setShowClaimForm(true);
    setShowCreate(false);
    try {
      const companies = await companyApi.getAll();
      setAllCompanies(companies);
    } catch (e) {}
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

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstin) {
      setError('GSTIN is mandatory for official verification.');
      return;
    }
    
    setIsStartingVerify(true);
    setError(null);
    try {
      const session = await companyVerifyApi.start(company.id, gstin, cinNumber || undefined);
      setVerifyStatus(session);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start verification');
    } finally {
      setIsStartingVerify(false);
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

  const handleAddFundingRound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await companyApi.addFundingRound(company.id, {
        stage: newFundingStage,
        amount: parseFloat(newFundingAmount),
        date: newFundingDate,
        investors: newFundingInvestors.split(',').map(i => i.trim()).filter(Boolean),
      });
      alert('Funding round added!');
      setShowFundingForm(false);
      setNewFundingAmount('');
      setNewFundingDate('');
      setNewFundingInvestors('');
      fetchCompany(); // Refresh trust profile
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add funding round');
    }
  };

  const handleGenerateCampaign = async () => {
    setIsGeneratingCampaign(true);
    setCampaignResults(null);
    try {
      const result = await aiApi.generateCampaign(company, campaignGoal);
      setCampaignResults(result);
    } catch (err) {
      console.error('Campaign generation failed:', err);
      setError('Failed to generate campaign. Please try again.');
    } finally {
      setIsGeneratingCampaign(false);
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
          
          {!showCreate && !showClaimForm && !activeClaim && (
            <div className="flex gap-4 justify-center">
              <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm">
                Register New Company
              </button>
              <button onClick={handleLoadCompanies} className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-medium rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
                Claim Existing Company
              </button>
            </div>
          )}

          {activeClaim && !company && (
            <div className="text-left mt-8">
              <OwnershipClaimFlow claim={activeClaim} onRefresh={fetchCompany} />
            </div>
          )}

          {showCreate && !activeClaim && (
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

          {showClaimForm && !activeClaim && (
            <form onSubmit={handleStartClaim} className="max-w-md mx-auto text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Company</label>
                <select required value={selectedCompanyId} onChange={e => setSelectedCompanyId(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 outline-none">
                  <option value="" disabled>Select a company...</option>
                  {allCompanies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.domain})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50" disabled={!selectedCompanyId}>Start Claim</button>
                <button type="button" onClick={() => setShowClaimForm(false)} className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
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
                  <form onSubmit={handleStartVerification} className="space-y-4">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Start the verification process by providing your company's legal identifiers.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">GSTIN (Mandatory)</label>
                        <input 
                          type="text" 
                          required 
                          value={gstin} 
                          onChange={e => setGstin(e.target.value)} 
                          placeholder="e.g. 22AAAAA0000A1Z5"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">CIN (Optional)</label>
                        <input 
                          type="text" 
                          value={cinNumber} 
                          onChange={e => setCinNumber(e.target.value)} 
                          placeholder="e.g. U12345MH2020PTC123456"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isStartingVerify}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {isStartingVerify && <Loader2 size={16} className="animate-spin" />}
                      Start Official Verification
                    </button>
                  </form>
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

          {/* AI Marketing & Campaigns Section */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <Megaphone size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Marketing Hub</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Generate high-impact campaigns in seconds.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Campaign Goal</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={campaignGoal} 
                    onChange={e => setCampaignGoal(e.target.value)}
                    placeholder="e.g. Announce our seed funding round" 
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                  />
                  <button 
                    onClick={handleGenerateCampaign}
                    disabled={isGeneratingCampaign || !campaignGoal}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md"
                  >
                    {isGeneratingCampaign ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    Generate
                  </button>
                </div>
              </div>

              {campaignResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  {campaignResults.campaigns.map((camp: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl ${
                        camp.type === 'professional' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {camp.type}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 mt-2">
                        {camp.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {camp.hashtags.map((tag: string, j: number) => (
                          <span key={j} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">#{tag}</span>
                        ))}
                      </div>
                      <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2">
                        <Send size={14} /> Copy & Post
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

          {/* Funding History Section */}
          {company.verificationStatus === 'verified' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Funding History</h2>
                {!showFundingForm && (
                  <button onClick={() => setShowFundingForm(true)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    + Add Round
                  </button>
                )}
              </div>

              {showFundingForm && (
                <form onSubmit={handleAddFundingRound} className="mb-6 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stage</label>
                      <input type="text" required value={newFundingStage} onChange={e => setNewFundingStage(e.target.value)} placeholder="e.g. Seed, Series A" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ($)</label>
                      <input type="number" required value={newFundingAmount} onChange={e => setNewFundingAmount(e.target.value)} placeholder="e.g. 500000" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                      <input type="date" required value={newFundingDate} onChange={e => setNewFundingDate(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Investors (comma separated)</label>
                      <input type="text" required value={newFundingInvestors} onChange={e => setNewFundingInvestors(e.target.value)} placeholder="e.g. Sequoia, YC" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Save Round</button>
                    <button type="button" onClick={() => setShowFundingForm(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg font-medium hover:bg-slate-300">Cancel</button>
                  </div>
                </form>
              )}

              {trustProfile?.fundingHistory?.length > 0 ? (
                <div className="space-y-3">
                  {trustProfile.fundingHistory.map((round: any) => (
                    <div key={round.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{round.stage}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(round.date).toLocaleDateString()} • {round.investors.join(', ')}</p>
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ${round.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showFundingForm && <p className="text-slate-500 dark:text-slate-400">No funding history recorded yet.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
