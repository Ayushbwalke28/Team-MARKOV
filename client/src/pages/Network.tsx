import { useState, useEffect } from 'react';
import { Users, UserCheck, UserMinus, UserPlus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { connectionApi } from '../lib/api';

export default function Network() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connData, reqData, sugData] = await Promise.all([
        connectionApi.getConnections(),
        connectionApi.getRequests(),
        connectionApi.getSuggestions(),
      ]);
      setConnections(connData);
      setRequests(reqData);
      setSuggestions(sugData);
    } catch (err) {
      console.error('Failed to fetch network data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await connectionApi.acceptRequest(id);
      fetchData(); // Refresh all to update lists
    } catch (err) {
      console.error('Failed to accept request', err);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await connectionApi.declineRequest(id);
      setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to decline request', err);
    }
  };

  const handleConnect = async (receiverId: string) => {
    try {
      await connectionApi.sendRequest(receiverId);
      setSuggestions(suggestions.filter(s => s.id !== receiverId));
      // In a real app, you might show a "Request Sent" status
    } catch (err) {
      console.error('Failed to send request', err);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    try {
      await connectionApi.removeConnection(id);
      setConnections(connections.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to remove connection', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Invitations Section */}
      {requests.length > 0 && (
        <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock size={18} className="text-primary" /> Pending Invitations ({requests.length})
            </h2>
          </div>
          <div className="divide-y divide-border">
            {requests.map((req) => (
              <div key={req.id} className="p-6 flex items-center justify-between hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-surface-brand flex items-center justify-center text-surface-brand-foreground font-bold text-lg overflow-hidden shrink-0">
                    {req.sender.avatarUrl ? (
                      <img src={req.sender.avatarUrl} alt={req.sender.name} className="w-full h-full object-cover" />
                    ) : (
                      req.sender.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">{req.sender.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{req.sender.profile?.about || 'Verified Professional'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <button
                    onClick={() => handleDecline(req.id)}
                    className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="px-4 py-2 text-xs font-bold text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connections List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users size={18} className="text-primary" /> Your Connections ({connections.length})
              </h2>
            </div>
            {connections.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">Build your professional network</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Connecting with colleagues and peers helps you discover new opportunities and insights.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {connections.map((conn) => (
                  <div key={conn.id} className="p-6 flex items-center justify-between hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-surface-brand flex items-center justify-center text-surface-brand-foreground font-bold overflow-hidden shrink-0">
                        {conn.user.avatarUrl ? (
                          <img src={conn.user.avatarUrl} alt={conn.user.name} className="w-full h-full object-cover" />
                        ) : (
                          conn.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground truncate">{conn.user.name}</h3>
                        <p className="text-[10px] text-muted-foreground truncate">{conn.user.profile?.about || 'Verified Professional'}</p>
                        <p className="text-[9px] text-muted-foreground/60 mt-0.5 uppercase tracking-wider font-medium">Connected {new Date(conn.connectedSince).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors" title="Message">
                        <UserCheck size={18} />
                      </button>
                      <button
                        onClick={() => handleRemove(conn.id)}
                        className="p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                        title="Remove Connection"
                      >
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Suggestions Sidebar */}
        <div className="flex flex-col gap-6">
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">People you may know</h2>
            <div className="flex flex-col gap-6">
              {suggestions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8 bg-secondary rounded-xl border border-dashed border-border">No suggestions available right now.</p>
              ) : (
                suggestions.map((sug) => (
                  <div key={sug.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-brand flex items-center justify-center text-surface-brand-foreground font-bold text-xs shrink-0 overflow-hidden">
                      {sug.avatarUrl ? (
                        <img src={sug.avatarUrl} alt={sug.name} className="w-full h-full object-cover" />
                      ) : (
                        sug.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{sug.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate leading-tight">{sug.profile?.about || 'Professional'}</p>
                    </div>
                    <button
                      onClick={() => handleConnect(sug.id)}
                      className="text-[10px] font-bold text-primary border border-primary/40 px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1 shrink-0"
                    >
                      <UserPlus size={12} /> Connect
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="bg-primary rounded-xl p-6 text-primary-foreground shadow-lg shadow-primary/20">
            <h3 className="font-bold text-sm mb-2">Expand Your Reach</h3>
            <p className="text-[10px] text-primary-foreground/80 leading-relaxed mb-4">A complete profile increases your chances of getting connection requests by 5x.</p>
            <button
              onClick={() => navigate('/settings?section=profile')}
              className="w-full bg-white text-primary py-2 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
