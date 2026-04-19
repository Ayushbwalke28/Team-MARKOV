import { useState, useEffect } from 'react';
import { investmentApi, companyApi } from '../lib/api';
import { Link } from 'react-router-dom';

export default function InvestorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [thesis, setThesis] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);

  // Trust Profile Modal State
  const [selectedTrustProfile, setSelectedTrustProfile] = useState<any>(null);
  const [loadingTrustProfile, setLoadingTrustProfile] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allCompanies = await companyApi.getAll();
      setCompanies(allCompanies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await investmentApi.createInvestorProfile({ investmentThesis: thesis });
      setHasProfile(true);
      alert('Investor profile created successfully! Pending admin approval.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create investor profile');
    }
  };

  const requestDealRoom = async (companyId: string) => {
    try {
      await investmentApi.requestDealRoom(companyId);
      alert('Deal room access requested!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request deal room. Are you a verified investor?');
    }
  };

  const viewTrustProfile = async (companyId: string) => {
    setLoadingTrustProfile(true);
    try {
      const profile = await companyApi.getTrustProfile(companyId);
      setSelectedTrustProfile(profile);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch trust profile');
    } finally {
      setLoadingTrustProfile(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading investor data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-foreground mb-8">💼 Investor Hub</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {!hasProfile ? (
        <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">Become an Investor</h2>
          <p className="text-muted-foreground mb-6">
            Create an investor profile to request access to startup deal rooms and view sensitive financial data.
          </p>
          
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Investment Thesis</label>
              <textarea 
                required 
                value={thesis} 
                onChange={e => setThesis(e.target.value)} 
                rows={4}
                placeholder="Describe your investment strategy, typical ticket size, and preferred sectors..."
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary outline-none resize-none transition-colors" 
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-sm"
            >
              Submit Profile for Verification
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Explore Startups</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.filter(c => c.verificationStatus === 'verified').map(company => (
                <div key={company.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.domain}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-lg border border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <button 
                      onClick={() => requestDealRoom(company.id)}
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      Request Deal Room
                    </button>
                    <button
                      onClick={() => viewTrustProfile(company.id)}
                      className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                    >
                      {loadingTrustProfile ? 'Loading...' : 'View Trust Profile'}
                    </button>
                  </div>
                </div>
              ))}
              {companies.filter(c => c.verificationStatus === 'verified').length === 0 && (
                <p className="text-muted-foreground col-span-2">No verified startups available for investment right now.</p>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">Your Profile</h2>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                <p className="text-emerald-500 font-medium text-sm">✅ Accredited Investor</p>
              </div>
              <p className="text-sm text-muted-foreground">
                You have full access to request deal rooms and sign NDAs directly with founders.
              </p>
            </div>
            {/* Display Active Deal Rooms Placeholder */}
            <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Active Deal Rooms</h2>
              <Link to="/deal-room/demo" className="block p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Acme Corp (Demo)</h3>
                    <p className="text-sm text-slate-500">Awaiting NDA</p>
                  </div>
                  <span className="text-indigo-600 dark:text-indigo-400">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trust Profile Modal */}
      {selectedTrustProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedTrustProfile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
                🛡️
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTrustProfile.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {selectedTrustProfile.verifiedBadge && (
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded flex items-center gap-1">
                      <span>✓</span> Verified Founder & Entity
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Trust Score: <span className="text-slate-900 dark:text-white">{selectedTrustProfile.trustScore}/100</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Business Proofs</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Incorporation Year</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedTrustProfile.businessProofs.startYear || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">GST Registration</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedTrustProfile.businessProofs.gstVerified ? '✅ Validated' : 'Not Provided'}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Domain Ownership</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedTrustProfile.businessProofs.domain || 'Not Provided'}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Funding History</h3>
                {selectedTrustProfile.fundingHistory?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTrustProfile.fundingHistory.map((round: any) => (
                      <div key={round.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-700/50">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{round.stage}</p>
                          <p className="text-xs text-slate-500">{round.investors.join(', ')}</p>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">${round.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No previous funding rounds reported.</p>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => {
                requestDealRoom(selectedTrustProfile.companyId);
                setSelectedTrustProfile(null);
              }}
              className="w-full mt-6 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Request Deal Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
