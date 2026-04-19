import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { investmentApi } from '../lib/api';

export default function DealRoomView() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealRoom, setDealRoom] = useState<any>(null);

  // Mock signing
  const [isSigning, setIsSigning] = useState(false);

  // Report Broker State
  const [showReportBroker, setShowReportBroker] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchDealRoom();
  }, [id]);

  const fetchDealRoom = async () => {
    setLoading(true);
    try {
      if (id === 'demo') {
        // Mock data for demo since routing might not pass a real ID right away
        setDealRoom({
          id: 'demo',
          status: 'active',
          ndaSigned: false,
          company: {
            name: 'Acme Corp',
            domain: 'acme.com',
            investmentProfile: {
              fundingStage: 'Seed',
              askAmount: 500000,
              pitchDeckUrl: 'https://example.com/pitch',
              financialsUrl: null, // Hidden because NDA not signed
            }
          }
        });
        setLoading(false);
        return;
      }

      const data = await investmentApi.getDealRoom(id!);
      setDealRoom(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch deal room');
    } finally {
      setLoading(false);
    }
  };

  const handleSignNda = async () => {
    setIsSigning(true);
    try {
      if (id === 'demo') {
        // Mock the signing success
        setTimeout(() => {
          setDealRoom((prev: any) => ({
            ...prev,
            ndaSigned: true,
            company: {
              ...prev.company,
              investmentProfile: {
                ...prev.company.investmentProfile,
                financialsUrl: 'https://secure.example.com/financials-2026.pdf', // Unlocked
              }
            }
          }));
          setIsSigning(false);
        }, 1500);
        return;
      }

      await investmentApi.signNda(id!, 'https://docusign.mock/signed.pdf');
      fetchDealRoom(); // Refresh to get unmasked data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign NDA');
      setIsSigning(false);
    }
  };

  const handleReportBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id === 'demo') {
        setDealRoom((prev: any) => ({
          ...prev,
          brokerFlagged: true,
          status: 'frozen',
        }));
        setShowReportBroker(false);
        return;
      }

      await investmentApi.reportBroker(id!, reportReason);
      setShowReportBroker(false);
      fetchDealRoom();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to report broker');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading Secure Deal Room...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 p-8 rounded-2xl">
          <div className="text-4xl mb-4">⛔</div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>{error}</p>
          <Link to="/investor" className="mt-6 inline-block px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            🔒 Secure Deal Room
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            End-to-end encrypted connection with {dealRoom.company.name}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowReportBroker(true)}
            className="px-4 py-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-500/20"
          >
            Report Unauthorized Broker
          </button>
          <Link to="/investor" className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
            Back
          </Link>
        </div>
      </div>

      {dealRoom.brokerFlagged && (
        <div className="mb-6 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-6 rounded-2xl flex items-start gap-4">
          <div className="text-3xl">⚠️</div>
          <div>
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Deal Room Frozen</h2>
            <p className="text-red-600 dark:text-red-400 mt-1">
              This deal room has been frozen because one of the parties was reported as an unauthorized broker. 
              Our Trust & Safety team is investigating the incident. All access to sensitive materials is currently suspended.
            </p>
          </div>
        </div>
      )}

      {/* Main content - Apply blur if frozen */}
      <div className={dealRoom.brokerFlagged ? 'opacity-50 filter blur-sm pointer-events-none' : ''}>
        {!dealRoom.ndaSigned ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 relative overflow-hidden shadow-sm dark:shadow-none">
          {/* Glassmorphism blur overlay over content */}
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">NDA Required</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-md mb-6">
              You must sign a Non-Disclosure Agreement before accessing {dealRoom.company.name}'s sensitive financial data and intellectual property.
            </p>
            <button 
              onClick={handleSignNda}
              disabled={isSigning}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isSigning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing via DocuSign...
                </>
              ) : (
                'Review & Sign NDA'
              )}
            </button>
          </div>

          {/* Blurred out content underneath */}
          <div className="opacity-30 filter blur-sm pointer-events-none">
            <div className="space-y-4">
              <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/3"></div>
              <div className="h-24 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-200 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400">✓</div>
            <div>
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">NDA Executed</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500/70">Cryptographically signed by both parties.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Investment Summary</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Funding Stage</dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-white">{dealRoom.company.investmentProfile?.fundingStage}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Ask Amount</dt>
                  <dd className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${dealRoom.company.investmentProfile?.askAmount?.toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Data Room Links</h3>
              <div className="space-y-3">
                <a 
                  href={dealRoom.company.investmentProfile?.pitchDeckUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors group shadow-sm dark:shadow-none"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium">Pitch Deck</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF Document</p>
                  </div>
                </a>

                {dealRoom.company.investmentProfile?.financialsUrl ? (
                  <a 
                    href={dealRoom.company.investmentProfile?.financialsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors group shadow-sm dark:shadow-none"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">📈</span>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">Financial Projections</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Unlocked</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl opacity-50 cursor-not-allowed shadow-sm dark:shadow-none">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">Financials</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">No data provided</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div> {/* End main content blur wrapper */}

      {/* Report Broker Modal */}
      {showReportBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowReportBroker(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🛡️</div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Report Broker</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Our platform strictly prohibits unauthorized intermediaries. If you suspect the other party is a broker, report them immediately. This will freeze the Deal Room.
            </p>
            <form onSubmit={handleReportBroker}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for Reporting</label>
                <textarea 
                  required
                  rows={4}
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Explain why you believe this user is an unauthorized broker..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-red-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors">
                  Report & Freeze Room
                </button>
                <button type="button" onClick={() => setShowReportBroker(false)} className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
