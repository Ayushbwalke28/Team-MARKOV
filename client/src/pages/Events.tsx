import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Search, ChevronRight, CheckCircle2, Clock, AlertTriangle, X, Plus, CreditCard, Lock, Ticket, IndianRupee } from 'lucide-react';
import api, { eventApi, eventFraudApi } from '../lib/api';

type EventType = 'all' | 'technology' | 'leadership' | 'networking' | 'design';
type ViewMode = 'explore' | 'my-bookings';

// ─── Create Event Modal ───────────────────────────────────────────────────────
function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Technology',
    organizerType: 'individual', schedule: '', fees: '',
    mode: 'offline', venue: '', onlinePlatform: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/events', {
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        organizerType: form.organizerType,
        schedule: new Date(form.schedule).toISOString(),
        fees: form.fees ? parseFloat(form.fees) : 0,
        mode: form.mode,
        venue: form.mode !== 'online' ? form.venue : undefined,
        onlinePlatform: form.mode !== 'offline' ? form.onlinePlatform : undefined,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border text-foreground rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none">
        {/* Header */}
        <div className="bg-surface-brand text-surface-brand-foreground px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">Create New Event</h3>
              <p className="text-[10px] text-surface-brand-foreground/60 uppercase tracking-widest">Event Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-brand-foreground/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl">{error}</div>
          )}

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Event Title *</label>
            <input
              required value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Tech Summit 2026"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="What is this event about?"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors">
                <option>Technology</option>
                <option>Leadership</option>
                <option>Networking</option>
                <option>Design</option>
                <option>Finance</option>
                <option>Healthcare</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Organizer Type</label>
              <select value={form.organizerType} onChange={e => set('organizerType', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors">
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Date & Time *</label>
              <input
                type="datetime-local" required value={form.schedule} onChange={e => set('schedule', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Entry Fee (₹)</label>
              <input
                type="number" min="0" step="0.01" value={form.fees} onChange={e => set('fees', e.target.value)}
                placeholder="0 for free"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Event Mode *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['offline', 'online', 'hybrid'] as const).map(m => (
                <button key={m} type="button" onClick={() => set('mode', m)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all capitalize ${
                    form.mode === m
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                      : 'bg-secondary text-muted-foreground border-border hover:border-primary/50'
                  }`}>
                  {m === 'offline' ? 'In-Person' : m === 'online' ? 'Virtual' : 'Hybrid'}
                </button>
              ))}
            </div>
          </div>

          {form.mode !== 'online' && (
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Venue</label>
              <input
                value={form.venue} onChange={e => set('venue', e.target.value)}
                placeholder="e.g. Convention Center, Mumbai"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
          {form.mode !== 'offline' && (
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Online Platform</label>
              <input
                value={form.onlinePlatform} onChange={e => set('onlinePlatform', e.target.value)}
                placeholder="e.g. Zoom, Google Meet link"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-secondary text-foreground border border-border rounded-xl text-sm font-bold hover:brightness-95 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:brightness-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Creating...</> : '+ Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Payment Gateway Modal ────────────────────────────────────────────────────
function PaymentModal({ event, onClose, onSuccess }: { event: any; onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<'confirm' | 'pay' | 'success'>('confirm');
  const [payMethod, setPayMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [upi, setUpi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isFree = !event.fees || event.fees === 0;

  const fmtCardNo = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const handlePay = async () => {
    setLoading(true);
    setError('');
    // Client-side validation before "payment"
    if (!isFree) {
      if (payMethod === 'card') {
        if (cardNo.replace(/\s/g, '').length < 16) return setLoading(false), setError('Please enter a valid 16-digit card number.');
        if (expiry.length < 5) return setLoading(false), setError('Please enter a valid expiry date.');
        if (cvv.length < 3) return setLoading(false), setError('Please enter a valid CVV.');
        if (!name.trim()) return setLoading(false), setError("Please enter the cardholder's name.");
      }
      if (payMethod === 'upi' && !upi.includes('@')) return setLoading(false), setError('Please enter a valid UPI ID (e.g. name@upi).');
    }
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1500));
    try {
      await eventApi.bookEvent(event.id);
      setStep('success');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg?.includes('already')) {
        setError('You have already registered for this event.');
      } else {
        setError(msg || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border text-foreground rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Success Screen */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-1">You're Registered!</h3>
            <p className="text-muted-foreground text-sm mb-2">{event.title}</p>
            <p className="text-xs text-muted-foreground mb-6">
              {isFree ? 'Free entry confirmed.' : `₹${event.fees} held in escrow. Released 24h after the event.`}
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
              <p className="text-emerald-500 text-xs font-bold flex items-center justify-center gap-2">
                <Ticket size={14} /> Booking confirmed — check My Bookings
              </p>
            </div>
            <button onClick={() => { onSuccess(); onClose(); }}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:brightness-90 transition-all shadow-lg shadow-primary/20">
              Done
            </button>
          </div>
        )}

        {/* Confirm & Pay Screen */}
        {step !== 'success' && (
          <>
            {/* Header */}
            <div className="bg-surface-brand text-surface-brand-foreground px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Secure Checkout</h3>
                  <p className="text-[10px] text-surface-brand-foreground/60 uppercase tracking-widest">
                    {isFree ? 'Free Registration' : 'Powered by Razorpay'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-brand-foreground/10 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Event Summary */}
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Event</p>
                <h4 className="font-bold text-foreground">{event.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{event.date} · {event.time} · {event.location}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground font-medium">Total Amount</span>
                  <span className="text-xl font-black text-foreground flex items-center gap-1">
                    {isFree ? (
                      <span className="text-emerald-500 text-base font-black">FREE</span>
                    ) : (
                      <><IndianRupee size={16} />{event.fees.toFixed(2)}</>
                    )}
                  </span>
                </div>
                {!isFree && (
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Lock size={10} /> Payment held in escrow for 24h after event for your protection.
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl">{error}</div>
              )}

              {/* Payment Method (only if paid) */}
              {!isFree && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Payment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { k: 'upi', label: 'UPI' },
                        { k: 'card', label: 'Card' },
                        { k: 'netbanking', label: 'Net Banking' },
                      ] as const).map(m => (
                        <button key={m.k} type="button" onClick={() => setPayMethod(m.k)}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            payMethod === m.k
                              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                              : 'bg-secondary text-muted-foreground border-border hover:border-primary/50'
                          }`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {payMethod === 'upi' && (
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">UPI ID</label>
                      <input
                        value={upi} onChange={e => setUpi(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  )}

                  {payMethod === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Card Number</label>
                        <div className="relative">
                          <input
                            value={cardNo} onChange={e => setCardNo(fmtCardNo(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors pr-10"
                          />
                          <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Cardholder Name</label>
                        <input
                          value={name} onChange={e => setName(e.target.value)}
                          placeholder="As on card"
                          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Expiry</label>
                          <input
                            value={expiry} onChange={e => setExpiry(fmtExpiry(e.target.value))}
                            placeholder="MM/YY"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">CVV</label>
                          <input
                            type="password" maxLength={4} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {payMethod === 'netbanking' && (
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Select Bank</label>
                      <select className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors">
                        <option>State Bank of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                        <option>Punjab National Bank</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:brightness-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Processing...</>
                ) : isFree ? (
                  <><Ticket size={16} /> Register for Free</>
                ) : (
                  <><Lock size={14} /> Pay ₹{event.fees?.toFixed(2)} Securely</>
                )}
              </button>

              {!isFree && (
                <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <Lock size={10} /> 256-bit SSL encrypted · Funds held in escrow
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Events Page ─────────────────────────────────────────────────────────
export default function Events() {
  const [activeTab, setActiveTab] = useState<EventType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentEvent, setPaymentEvent] = useState<any | null>(null);

  // Fraud Report State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingEventId, setReportingEventId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  useEffect(() => {
    if (viewMode === 'explore') fetchEvents();
    else if (viewMode === 'my-bookings') fetchMyBookings();
  }, [viewMode]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.map((e: any) => ({
        ...e,
        date: new Date(e.schedule).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date(e.schedule).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        type: e.category?.toLowerCase() || 'technology',
        attendees: e._count?.bookings || 0,
        mode: e.mode.charAt(0).toUpperCase() + e.mode.slice(1),
        location: e.venue || e.onlinePlatform || 'TBA',
        verified: e.organizerUser?.verified || false,
      })));
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const data = await eventApi.getMyBookings();
      setBookings(data.map((b: any) => ({
        ...b,
        event: {
          ...b.event,
          date: new Date(b.event.schedule).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date(b.event.schedule).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          mode: b.event.mode.charAt(0).toUpperCase() + b.event.mode.slice(1),
          type: b.event.category?.toLowerCase() || 'technology',
          location: b.event.venue || b.event.onlinePlatform || 'TBA',
        }
      })));
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  const submitFraudReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingEventId) return;
    try {
      await eventFraudApi.reportFraud(reportingEventId, { reason: reportReason, details: reportDetails });
      setReportSuccess('Issue reported successfully. Escrow payout has been frozen pending review.');
      setTimeout(() => { setReportModalOpen(false); setReportSuccess(''); }, 3000);
    } catch (err) {
      console.error('Failed to report fraud', err);
    }
  };

  const filteredEvents = events.filter(e =>
    (activeTab === 'all' || e.type === activeTab) &&
    (e.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">Events</h2>
          <p className="text-sm text-muted-foreground mt-1">Discover conferences, workshops, and networking opportunities.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold hover:brightness-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={14} /> Create Event
        </button>
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text" placeholder="Search events by title, keyword, or speaker..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-foreground text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1 border border-border">
          <button
            onClick={() => setViewMode('explore')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'explore' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            Explore
          </button>
          <button
            onClick={() => setViewMode('my-bookings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'my-bookings' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            My Bookings
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      {viewMode === 'explore' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(['all', 'technology', 'leadership', 'networking', 'design'] as EventType[]).map(t => (
            <button
              key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-full text-xs font-bold border transition-all shrink-0 capitalize ${
                activeTab === t
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      )}

      {/* Events Grid */}
      {viewMode === 'explore' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.length === 0 && (
            <div className="col-span-2 text-center py-16 text-muted-foreground">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No events found</p>
              <p className="text-sm mt-1">Be the first to create one!</p>
            </div>
          )}
          {filteredEvents.map((e) => (
            <div key={e.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-foreground/5 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer flex flex-col md:flex-row">
              {/* Left Date Panel */}
              <div className="md:w-1/3 bg-secondary flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border relative">
                <div className="w-12 h-12 rounded-2xl bg-surface-brand flex items-center justify-center text-surface-brand-foreground mb-3 shadow-lg group-hover:bg-primary transition-colors">
                  <Calendar size={22} />
                </div>
                <p className="text-sm font-bold text-foreground text-center">{e.date}</p>
                <p className="text-[10px] text-muted-foreground mt-1 shrink-0">{e.mode}</p>
                {/* Fee Badge */}
                <div className={`mt-2 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                  !e.fees || e.fees === 0
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}>
                  {!e.fees || e.fees === 0 ? 'FREE' : `₹${e.fees}`}
                </div>
                {e.verified && (
                  <div className="absolute top-3 right-3 text-primary">
                    <CheckCircle2 size={15} fill="currentColor" className="fill-primary/10" />
                  </div>
                )}
              </div>

              {/* Right Details */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    e.mode === 'Online' ? 'bg-purple-500/10 text-purple-500' : 'bg-primary/10 text-primary'
                  }`}>
                    {e.mode}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">
                    {e.type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{e.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{e.description}</p>

                <div className="mt-auto flex flex-col gap-2 pt-4">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <MapPin size={12} /> {e.location}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                        <Users size={12} /> {e.attendees.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                        <Clock size={12} /> {e.time}
                      </div>
                    </div>
                    {new Date(e.schedule) > new Date() ? (
                      <button
                        onClick={() => setPaymentEvent(e)}
                        className="text-[10px] font-black text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform hover:underline"
                      >
                        Register Now <ChevronRight size={12} />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground">Event Ended</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // My Bookings View
        <div className="grid grid-cols-1 gap-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">{b.event.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{b.event.date} · {b.event.time}</p>
                <div className="mt-3 flex items-center gap-2">
                  {b.escrowStatus === 'held' && (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      Payment in Escrow
                    </span>
                  )}
                  {b.escrowStatus === 'released' && (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold">✓ Payment Released</span>
                  )}
                  {b.escrowStatus === 'refunded' && (
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-xs font-bold">↩ Refunded</span>
                  )}
                  {!b.escrowStatus && (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold">✓ Confirmed</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setReportingEventId(b.eventId); setReportModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold transition-colors"
                >
                  <AlertTriangle size={14} /> Report Issue
                </button>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Ticket size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No bookings yet</p>
              <p className="text-sm mt-1">Register for events to see them here.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {createModalOpen && (
        <CreateEventModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={fetchEvents}
        />
      )}

      {/* Payment Modal */}
      {paymentEvent && (
        <PaymentModal
          event={paymentEvent}
          onClose={() => setPaymentEvent(null)}
          onSuccess={fetchEvents}
        />
      )}

      {/* Fraud Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border text-foreground rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <button onClick={() => setReportModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X size={20} />
            </button>
            <div className="p-8">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">Report Event Issue</h3>
              <p className="text-sm text-muted-foreground mb-6">
                If the event was cancelled or misrepresented, report it here. We hold payments in escrow for 24 hours post-event to protect attendees.
              </p>
              {reportSuccess ? (
                <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl text-sm font-medium border border-emerald-500/20">
                  {reportSuccess}
                </div>
              ) : (
                <form onSubmit={submitFraudReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Reason for reporting</label>
                    <select required value={reportReason} onChange={e => setReportReason(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors">
                      <option value="">Select a reason...</option>
                      <option>Event did not happen</option>
                      <option>Event was severely misrepresented</option>
                      <option>Organizer did not show up</option>
                      <option>Scam/Fraudulent Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Additional Details (Optional)</label>
                    <textarea rows={3} value={reportDetails} onChange={e => setReportDetails(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary resize-none transition-colors" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-red-500/90 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-500/20">
                    Submit Report & Freeze Payout
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
