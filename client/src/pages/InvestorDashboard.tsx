import { useState, useEffect } from 'react';
import { investmentApi, companyApi } from '../lib/api';
import { Link } from 'react-router-dom';

export default function InvestorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasProfile, setHasProfile] = useState(false);
  const [thesis, setThesis] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, we'd have a specific endpoint to fetch the user's investor profile
      // and their deal rooms. For now, we'll try to fetch companies to show potential investments.
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

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading investor data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">💼 Investor Hub</h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {!hasProfile ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 max-w-2xl shadow-sm dark:shadow-none">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Become an Investor</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Create an investor profile to request access to startup deal rooms and view sensitive financial data.
          </p>
          
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Investment Thesis</label>
              <textarea 
                required 
                value={thesis} 
                onChange={e => setThesis(e.target.value)} 
                rows={4}
                placeholder="Describe your investment strategy, typical ticket size, and preferred sectors..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 outline-none resize-none" 
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm">
              Submit Profile for Verification
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Explore Startups</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.filter(c => c.verificationStatus === 'verified').map(company => (
                <div key={company.id} className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm dark:shadow-none">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{company.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{company.domain}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <button 
                      onClick={() => requestDealRoom(company.id)}
                      className="px-4 py-2 bg-indigo-100 dark:bg-indigo-600/20 hover:bg-indigo-200 dark:hover:bg-indigo-600/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      Request Deal Room
                    </button>
                    {/* Placeholder for viewing an active deal room for demo purposes */}
                    <Link to={`/deal-room/demo`} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline">
                      View Room
                    </Link>
                  </div>
                </div>
              ))}
              {companies.filter(c => c.verificationStatus === 'verified').length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 col-span-2">No verified startups available for investment right now.</p>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Profile</h2>
              <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl mb-4">
                <p className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">✅ Accredited Investor</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You have full access to request deal rooms and sign NDAs directly with founders.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
