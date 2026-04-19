import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Search, ChevronRight, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';
import api, { eventApi, eventFraudApi } from '../lib/api';

type EventType = 'all' | 'technology' | 'leadership' | 'networking' | 'design';
type ViewMode = 'explore' | 'my-events' | 'my-bookings';

export default function Events() {
  const [activeTab, setActiveTab] = useState<EventType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  // Fraud Report State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingEventId, setReportingEventId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  
  // Booking Modal State
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'explore') fetchEvents();
    else if (viewMode === 'my-bookings') fetchMyBookings();
    else if (viewMode === 'my-events') fetchEvents(); // simplified
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
        verified: e.organizerUser?.verified || false
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
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess('');
      }, 3000);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0A1628]">Events</h2>
          <p className="text-sm text-[#75777d] mt-1">Discover conferences, workshops, and networking opportunities.</p>
        </div>
        <button className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#101c2e] transition-colors shadow-sm">
          + Create Event
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" size={18} />
          <input 
            type="text" 
            placeholder="Search events by title, keyword, or speaker..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#e0e3e5] text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/30 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#f2f4f6] rounded-xl p-1">
          <button 
            onClick={() => setViewMode('explore')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'explore' ? 'bg-white text-[#0A1628] shadow-sm' : 'text-[#75777d] hover:text-[#191c1e]'}`}>
            Explore
          </button>
          <button 
            onClick={() => setViewMode('my-bookings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'my-bookings' ? 'bg-white text-[#0A1628] shadow-sm' : 'text-[#75777d] hover:text-[#191c1e]'}`}>
            My Bookings
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {([
          { key: 'all', label: 'All' },
          { key: 'technology', label: 'Technology' },
          { key: 'leadership', label: 'Leadership' },
          { key: 'networking', label: 'Networking' },
          { key: 'design', label: 'Design' },
        ] as { key: EventType; label: string }[]).map((t) => (
          <button 
            key={t.key} 
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-full text-xs font-bold border transition-all shrink-0 ${
              activeTab === t.key 
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-[#2563EB]/20' 
                : 'bg-white text-[#45474c] border-[#e0e3e5] hover:border-[#2563EB]/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {viewMode === 'explore' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl border border-[#e0e3e5] overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col md:flex-row">
              <div className={`md:w-1/3 bg-[#f7f9fb] flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[#f2f4f6] relative`}>
                <div className="w-12 h-12 rounded-2xl bg-[#0A1628] flex items-center justify-center text-white mb-3 shadow-lg group-hover:bg-[#2563EB] transition-colors">
                  <Calendar size={24} />
                </div>
                <p className="text-sm font-bold text-[#0A1628] text-center">{e.date}</p>
                <p className="text-[10px] text-[#75777d] mt-1 shrink-0">{e.mode}</p>
                <div className="absolute top-4 right-4 text-[#2563EB]">
                  {e.verified && <CheckCircle2 size={16} fill="currentColor" className="fill-[#2563EB]/10" />}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    e.mode === 'Virtual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {e.mode === 'Virtual' ? 'Virtual' : 'In-Person'}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {e.type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0A1628] group-hover:text-[#2563EB] transition-colors line-clamp-1">{e.title}</h3>
                <p className="text-xs text-[#75777d] mt-2 line-clamp-2 leading-relaxed">{e.description}</p>
                
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] text-[#45474c] font-medium">
                    <MapPin size={12} className="text-[#c5c6cd]" /> {e.location}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#f2f4f6]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-[#45474c] font-bold">
                        <Users size={12} className="text-[#c5c6cd]" /> {e.attendees.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#45474c] font-bold">
                        <Clock size={12} className="text-[#c5c6cd]" /> {e.time.split(' ')[0]}
                      </div>
                    </div>
                    <button 
                      onClick={(e_stop) => {
                        e_stop.stopPropagation();
                        setSelectedEvent(e);
                      }}
                      className="text-[10px] font-black text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      {new Date(e.schedule) > new Date() ? (e.fees > 0 ? `Book - ₹${e.fees}` : 'Register Free') : 'View Details'} <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-[#e0e3e5] p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-lg font-bold text-[#0A1628]">{b.event.title}</h3>
                <p className="text-sm text-[#75777d] mt-1">{b.event.date} • {b.event.time}</p>
                
                <div className="mt-3 flex items-center gap-2">
                  {b.escrowStatus === 'held' && (
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      Payment in Escrow
                    </span>
                  )}
                  {b.escrowStatus === 'released' && (
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-xs font-bold">
                      ✓ Payment Released
                    </span>
                  )}
                  {b.escrowStatus === 'refunded' && (
                    <span className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-full text-xs font-bold">
                      ↩ Refunded
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setReportingEventId(b.eventId);
                    setReportModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl text-xs font-bold transition-colors"
                >
                  <AlertTriangle size={14} /> Report Issue
                </button>
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-sm text-[#75777d]">You haven't booked any events yet.</p>}
        </div>
      )}

      {/* Fraud Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setReportModalOpen(false)}
              className="absolute top-4 right-4 text-[#75777d] hover:text-[#0A1628]"
            >
              <X size={20} />
            </button>
            <div className="p-8">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-500 mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-2xl font-black text-[#0A1628] mb-2">Report Event Issue</h3>
              <p className="text-sm text-[#75777d] mb-6">
                If the event was cancelled or misrepresented, report it here. We hold payments in escrow for 24 hours post-event to protect attendees.
              </p>
              
              {reportSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium border border-emerald-200 dark:border-emerald-500/20">
                  {reportSuccess}
                </div>
              ) : (
                <form onSubmit={submitFraudReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#45474c] mb-1">Reason for reporting</label>
                    <select 
                      required
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/30"
                    >
                      <option value="">Select a reason...</option>
                      <option value="Event did not happen">Event did not happen</option>
                      <option value="Event was severely misrepresented">Event was severely misrepresented</option>
                      <option value="Organizer did not show up">Organizer did not show up</option>
                      <option value="Scam/Fraudulent Event">Scam / Fraudulent Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#45474c] mb-1">Additional Details (Optional)</label>
                    <textarea 
                      rows={3}
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/30 resize-none"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">
                    Submit Report & Freeze Payout
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Booking Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => {
                setSelectedEvent(null);
                setBookingSuccess('');
                setBookingError('');
              }}
              className="absolute top-4 right-4 text-[#75777d] hover:text-[#0A1628] z-10"
            >
              <X size={20} />
            </button>
            
            <div className="relative h-48 bg-[#0A1628] flex items-center justify-center overflow-hidden">
              {selectedEvent.bannerUrl ? (
                <img src={selectedEvent.bannerUrl} alt={selectedEvent.title} className="w-full h-full object-cover opacity-60" />
              ) : (
                <Calendar size={64} className="text-white/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] to-transparent" />
              <div className="absolute bottom-6 left-8 right-8 text-white">
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#2563EB] text-white mb-2 inline-block">
                  {selectedEvent.type}
                </span>
                <h3 className="text-2xl font-black">{selectedEvent.title}</h3>
              </div>
            </div>

            <div className="p-8">
              <p className="text-sm text-[#75777d] leading-relaxed mb-6">
                {selectedEvent.description || 'No description provided for this event.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#f7f9fb] p-4 rounded-2xl border border-[#e0e3e5]">
                  <p className="text-[10px] font-black text-[#75777d] uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="text-sm font-bold text-[#0A1628]">{selectedEvent.date} • {selectedEvent.time}</p>
                </div>
                <div className="bg-[#f7f9fb] p-4 rounded-2xl border border-[#e0e3e5]">
                  <p className="text-[10px] font-black text-[#75777d] uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm font-bold text-[#0A1628]">{selectedEvent.location}</p>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-sm font-bold border border-emerald-100 flex items-center gap-3">
                  <CheckCircle2 size={20} />
                  Booking Confirmed! Check "My Bookings" for details.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingError && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
                      {bookingError}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-4 bg-[#0A1628]/5 rounded-2xl mb-4">
                    <span className="text-sm font-bold text-[#0A1628]">Registration Fee</span>
                    <span className="text-lg font-black text-[#0A1628]">
                      {selectedEvent.fees > 0 ? `₹${selectedEvent.fees}` : 'FREE'}
                    </span>
                  </div>

                  <button 
                    disabled={bookingLoading}
                    onClick={async () => {
                      setBookingLoading(true);
                      setBookingError('');
                      try {
                        if (selectedEvent.fees <= 0) {
                          await eventApi.bookEvent(selectedEvent.id);
                          setBookingSuccess('Success');
                          fetchEvents();
                        } else {
                          // Razorpay Flow
                          const orderData = await eventApi.createRazorpayOrder(selectedEvent.id);
                          
                          const options = {
                            key: orderData.key,
                            amount: orderData.amount,
                            currency: orderData.currency,
                            name: "Team MARKOV",
                            description: `Booking for ${selectedEvent.title}`,
                            order_id: orderData.orderId,
                            handler: async (response: any) => {
                              try {
                                await eventApi.verifyRazorpayPayment(selectedEvent.id, {
                                  razorpay_order_id: response.razorpay_order_id,
                                  razorpay_payment_id: response.razorpay_payment_id,
                                  razorpay_signature: response.razorpay_signature,
                                });
                                setBookingSuccess('Success');
                                fetchEvents();
                              } catch (err: any) {
                                setBookingError(err.response?.data?.message || 'Payment verification failed');
                              }
                            },
                            prefill: {
                              name: "", // Can be filled if user profile is available
                              email: "",
                            },
                            theme: {
                              color: "#0A1628",
                            },
                          };
                          
                          const rzp = new (window as any).Razorpay(options);
                          rzp.open();
                        }
                      } catch (err: any) {
                        setBookingError(err.response?.data?.message || 'Booking failed');
                      } finally {
                        setBookingLoading(false);
                      }
                    }}
                    className={`w-full py-4 rounded-2xl text-sm font-black transition-all shadow-lg ${
                      bookingLoading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-[#2563EB]/20'
                    }`}
                  >
                    {bookingLoading ? 'Processing...' : selectedEvent.fees > 0 ? 'Pay & Register' : 'Register Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
