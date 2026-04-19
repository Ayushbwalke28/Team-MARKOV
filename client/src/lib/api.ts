import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

export const connectionApi = {
  getConnections: () => api.get('/connections').then(res => res.data),
  getRequests: () => api.get('/connections/requests').then(res => res.data),
  getSuggestions: () => api.get('/connections/suggestions').then(res => res.data),
  sendRequest: (receiverId: string) => api.post(`/connections/request/${receiverId}`).then(res => res.data),
  acceptRequest: (connectionId: string) => api.patch(`/connections/accept/${connectionId}`).then(res => res.data),
  declineRequest: (connectionId: string) => api.patch(`/connections/decline/${connectionId}`).then(res => res.data),
  removeConnection: (connectionId: string) => api.delete(`/connections/${connectionId}`).then(res => res.data),
};

export const profileApi = {
  getMe: () => api.get('/profile/me').then(res => res.data),
  updateMe: (payload: any) => api.patch('/profile/me', payload).then(res => res.data),
};

export const postApi = {
  create: (payload: { text: string; authorType: 'user' | 'company'; media?: string[] }) =>
    api.post('/posts', payload).then(res => res.data),
  uploadMedia: (postId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/posts/${postId}/media`, formData).then(res => res.data);
  },
  getComments: (postId: string) => api.get(`/posts/${postId}/comments`).then(res => res.data),
  addComment: (postId: string, text: string) => api.post(`/posts/${postId}/comments`, { text }).then(res => res.data),
};

export const verificationApi = {
  // User-facing endpoints
  start: () => api.post('/verify/start').then(res => res.data),
  getMyStatus: () => api.get('/verify/me').then(res => res.data),
  getSessionStatus: (sessionId: string) =>
    api.get(`/verify/status/${sessionId}`).then(res => res.data),
  getConsentInfo: () => api.get('/verify/consent').then(res => res.data),
  recordConsent: (sessionId: string, consent: boolean) =>
    api.post(`/verify/consent/${sessionId}`, { consent }).then(res => res.data),
  uploadDocument: (sessionId: string, documentType: string, front: File, back?: File) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('front', front);
    if (back) formData.append('back', back);
    return api.post(`/verify/${sessionId}/document`, formData).then(res => res.data);
  },
  captureFace: (sessionId: string, selfieBlob: Blob) => {
    const formData = new FormData();
    formData.append('selfie', selfieBlob, 'selfie.jpg');
    return api.post(`/verify/${sessionId}/face`, formData).then(res => res.data);
  },
  retry: () => api.post('/verify/retry').then(res => res.data),
  deleteData: () => api.delete('/verify/data').then(res => res.data),

  // Admin endpoints
  adminGetQueue: (status?: string, page?: number, limit?: number) =>
    api.get('/verify/admin/queue', { params: { status, page, limit } }).then(res => res.data),
  adminGetDetail: (reviewId: string) =>
    api.get(`/verify/admin/queue/${reviewId}`).then(res => res.data),
  adminSubmitDecision: (reviewId: string, decision: string, notes?: string) =>
    api.patch(`/verify/admin/queue/${reviewId}`, { decision, notes }).then(res => res.data),
  adminGetAuditLog: (page?: number, limit?: number) =>
    api.get('/verify/admin/audit-log', { params: { page, limit } }).then(res => res.data),
};

export const companyVerifyApi = {
  start: (companyId: string, gstin: string, cinNumber?: string) => 
    api.post('/company-verify/start', { companyId, gstin, cinNumber }).then(res => res.data),
  uploadDocument: (sessionId: string, documentType: string, fileUrl: string) => 
    api.post(`/company-verify/${sessionId}/upload`, { documentType, fileUrl }).then(res => res.data),
  submitValidation: (sessionId: string) => api.post(`/company-verify/${sessionId}/submit`).then(res => res.data),
  getStatus: (sessionId: string) => api.get(`/company-verify/${sessionId}/status`).then(res => res.data),
};

export const eventFraudApi = {
  reportFraud: (eventId: string, payload: { reason: string; details?: string }) => 
    api.post(`/events/${eventId}/report-fraud`, payload).then(res => res.data),
};

export const investmentApi = {
  createCompanyProfile: (companyId: string, payload: any) => 
    api.post(`/investments/company/${companyId}/profile`, payload).then(res => res.data),
  createInvestorProfile: (payload: any) => 
    api.post(`/investments/investor/profile`, payload).then(res => res.data),
  requestDealRoom: (companyId: string) => 
    api.post(`/investments/deal-room/${companyId}`).then(res => res.data),
  signNda: (dealRoomId: string, ndaUrl: string) => 
    api.patch(`/investments/deal-room/${dealRoomId}/nda`, { ndaUrl }).then(res => res.data),
  getDealRoom: (dealRoomId: string) => 
    api.get(`/investments/deal-room/${dealRoomId}`).then(res => res.data),
  verifyAccreditation: (documentUrl: string) => 
    api.post(`/investments/investor/verify-accreditation`, { documentUrl }).then(res => res.data),
  reportBroker: (dealRoomId: string, reason: string) => 
    api.post(`/investments/deal-room/${dealRoomId}/report-broker`, { reason }).then(res => res.data),
};

export const companyApi = {
  getAll: () => api.get('/companies').then(res => res.data),
  getMyCompany: () => api.get('/companies/mine').then(res => res.data),
  create: (payload: any) => api.post('/companies', payload).then(res => res.data),
  getTrustProfile: (companyId: string) => api.get(`/companies/${companyId}/trust-profile`).then(res => res.data),
  addFundingRound: (companyId: string, payload: any) => api.post(`/companies/${companyId}/funding-rounds`, payload).then(res => res.data),
};

export const eventApi = {
  getEvents: () => api.get('/events').then(res => res.data),
  getMyBookings: () => api.get('/events/my-bookings').then(res => res.data),
  bookEvent: (eventId: string) => api.post(`/events/${eventId}/book`).then(res => res.data),
  createRazorpayOrder: (eventId: string) => api.post(`/events/${eventId}/razorpay-order`).then(res => res.data),
  verifyRazorpayPayment: (eventId: string, payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => 
    api.post(`/events/${eventId}/razorpay-verify`, payload).then(res => res.data),
};

export const ownershipClaimApi = {
  create: (companyId: string, requestedRole?: string) => 
    api.post('/ownership-claims', { companyId, requestedRole }).then(res => res.data),
  getMyClaims: () => api.get('/ownership-claims/my').then(res => res.data),
  getDetail: (claimId: string) => api.get(`/ownership-claims/${claimId}`).then(res => res.data),
  withdraw: (claimId: string) => api.delete(`/ownership-claims/${claimId}`).then(res => res.data),
  sendDomainOtp: (claimId: string, email: string) => 
    api.post(`/ownership-claims/${claimId}/domain-email/send-otp`, { email }).then(res => res.data),
  verifyDomainOtp: (claimId: string, otp: string) => 
    api.post(`/ownership-claims/${claimId}/domain-email/verify`, { otp }).then(res => res.data),
  uploadDocuments: (claimId: string, authorizationLetterUrl: string, governmentIdUrl?: string) => 
    api.post(`/ownership-claims/${claimId}/documents`, { authorizationLetterUrl, governmentIdUrl }).then(res => res.data),
  validateGstin: (claimId: string, gstin: string, cinNumber?: string) => 
    api.post(`/ownership-claims/${claimId}/gst-validate`, { gstin, cinNumber }).then(res => res.data),
  requestAdminReview: (claimId: string) => 
    api.post(`/ownership-claims/${claimId}/request-admin-review`).then(res => res.data),
};

export const adminClaimApi = {
  getStats: () => api.get('/admin/ownership-claims/stats').then(res => res.data),
  listClaims: (status?: string, page?: number, limit?: number) => 
    api.get('/admin/ownership-claims', { params: { status, page, limit } }).then(res => res.data),
  getDetail: (claimId: string) => api.get(`/admin/ownership-claims/${claimId}`).then(res => res.data),
  decide: (claimId: string, payload: { decision: string; grantRole?: string; notes?: string }) => 
    api.patch(`/admin/ownership-claims/${claimId}/decide`, payload).then(res => res.data),
};

export const aiApi = {
  suggestProfileImprovements: (profileData: any) => 
    api.post('/ai/profile/suggest', { profileData }).then(res => res.data),
  generateCampaign: (companyData: any, goal: string) => 
    api.post('/ai/campaign/generate', { companyData, goal }).then(res => res.data),
  chat: (messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) => 
    api.post('/ai/chat', { messages }).then(res => res.data),
};

export default api;
