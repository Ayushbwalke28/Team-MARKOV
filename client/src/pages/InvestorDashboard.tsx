import { useState, useEffect } from 'react';
import { investmentApi, companyApi } from '../lib/api';
import { Link } from 'react-router-dom';

export default function InvestorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [thesis, setThesis] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, []);

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
                    <Link
                      to="/deal-room/demo"
                      className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      View Room
                    </Link>
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
          </div>
        </div>
      )}
    </div>
  );
}
