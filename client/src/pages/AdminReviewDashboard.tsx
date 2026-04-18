import { useState, useEffect, useCallback } from 'react';
import VerificationStatusBadge from '../components/verification/VerificationStatus';
import { verificationApi } from '../lib/api';

type Tab = 'queue' | 'audit';

interface ReviewItem {
  id: string;
  reason: string;
  reviewDecision: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  slaDeadline: string;
  createdAt: string;
  verificationSession: {
    id: string;
    userId: string;
    status: string;
    documentType: string | null;
    confidenceScore: number | null;
    faceMatchScore: number | null;
    livenessPass: boolean | null;
    attemptNumber: number;
    createdAt: string;
  };
}

export default function AdminReviewDashboard() {
  const [tab, setTab] = useState<Tab>('queue');
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const status = tab === 'queue' ? 'pending' : 'reviewed';
      const res = await verificationApi.adminGetQueue(status, page);
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmitDecision = async () => {
    if (!selectedItem || !decision) return;
    setSubmitting(true);
    setError(null);
    try {
      await verificationApi.adminSubmitDecision(selectedItem.id, decision, notes || undefined);
      setSelectedItem(null);
      setDecision('');
      setNotes('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();
  const isOverdue = (d: string) => new Date(d) < new Date();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🛡️ Verification Review Dashboard</h1>
          <p style={styles.subtitle}>Review and manage identity verification requests</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'queue' ? styles.tabActive : {}) }}
            onClick={() => { setTab('queue'); setSelectedItem(null); }}
          >
            📋 Review Queue
          </button>
          <button
            style={{ ...styles.tab, ...(tab === 'audit' ? styles.tabActive : {}) }}
            onClick={() => { setTab('audit'); setSelectedItem(null); }}
          >
            📜 Audit Log
          </button>
        </div>

        {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

        <div style={styles.content}>
          {/* List */}
          <div style={styles.list}>
            {loading ? (
              <div style={styles.loadingBox}>Loading...</div>
            ) : items.length === 0 ? (
              <div style={styles.emptyBox}>
                {tab === 'queue' ? '✅ No pending reviews' : '📜 No audit entries yet'}
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.listItem,
                    ...(selectedItem?.id === item.id ? styles.listItemSelected : {}),
                  }}
                  onClick={() => setSelectedItem(item)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={styles.listItemTop}>
                    <VerificationStatusBadge
                      status={item.verificationSession.status}
                      size="sm"
                    />
                    {tab === 'queue' && isOverdue(item.slaDeadline) && (
                      <span style={styles.overdueBadge}>⏰ OVERDUE</span>
                    )}
                  </div>
                  <div style={styles.listItemMeta}>
                    <span>User: {item.verificationSession.userId.slice(0, 8)}...</span>
                    <span>Score: {item.verificationSession.confidenceScore != null
                      ? `${(item.verificationSession.confidenceScore * 100).toFixed(0)}%`
                      : 'N/A'}</span>
                  </div>
                  <div style={styles.listItemReason}>{item.reason}</div>
                  <div style={styles.listItemDate}>{formatDate(item.createdAt)}</div>
                  {item.reviewDecision && (
                    <div style={{
                      ...styles.decisionBadge,
                      color: item.reviewDecision === 'approved' ? '#10b981' : '#ef4444',
                      background: item.reviewDecision === 'approved'
                        ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    }}>
                      {item.reviewDecision === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={styles.pagination}>
                <button
                  style={styles.pageBtn}
                  disabled={pagination.page <= 1}
                  onClick={() => fetchData(pagination.page - 1)}
                >← Prev</button>
                <span style={styles.pageInfo}>
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                <button
                  style={styles.pageBtn}
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchData(pagination.page + 1)}
                >Next →</button>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedItem && (
            <div style={styles.detailPanel}>
              <h3 style={styles.detailTitle}>Review Details</h3>

              <div style={styles.detailGrid}>
                <div style={styles.detailField}>
                  <span style={styles.detailLabel}>Session ID</span>
                  <span style={styles.detailValue}>{selectedItem.verificationSession.id}</span>
                </div>
                <div style={styles.detailField}>
                  <span style={styles.detailLabel}>User ID</span>
                  <span style={styles.detailValue}>{selectedItem.verificationSession.userId}</span>
                </div>
                <div style={styles.detailField}>
                  <span style={styles.detailLabel}>Document Type</span>
                  <span style={styles.detailValue}>
                    {selectedItem.verificationSession.documentType || 'Unknown'}
                  </span>
                </div>
                <div style={styles.detailField}>
                  <span style={styles.detailLabel}>Confidence</span>
                  <span style={styles.detailValue}>
                    {selectedItem.verificationSession.confidenceScore != null
                      ? `${(selectedItem.verificationSession.confidenceScore * 100).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
                <div style={styles.detailField}>
                  <span style={styles.detailLabel}>Face Match</span>
                  <span style={styles.detailValue}>
                    {selectedItem.verificationSession.faceMatchScore != null
                      ? `${(selectedItem.verificationSession.faceMatchScore * 100).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
                <div style={styles.detailField}>
                  <span style={styles.detailLabel}>Liveness</span>
                  <span style={styles.detailValue}>
                    {selectedItem.verificationSession.livenessPass ? '✅ Passed' : '❌ Failed'}
                  </span>
                </div>
                <div style={styles.detailField}>
                  <span style={styles.detailLabel}>Attempt #</span>
                  <span style={styles.detailValue}>
                    {selectedItem.verificationSession.attemptNumber}
                  </span>
                </div>
                <div style={styles.detailField}>
                  <span style={styles.detailLabel}>SLA Deadline</span>
                  <span style={{
                    ...styles.detailValue,
                    color: isOverdue(selectedItem.slaDeadline) ? '#ef4444' : undefined,
                  }}>
                    {formatDate(selectedItem.slaDeadline)}
                  </span>
                </div>
              </div>

              <div style={styles.detailField}>
                <span style={styles.detailLabel}>Reason for Review</span>
                <span style={styles.detailValue}>{selectedItem.reason}</span>
              </div>

              {/* Decision form (only for pending reviews) */}
              {!selectedItem.reviewDecision && tab === 'queue' && (
                <div style={styles.decisionForm}>
                  <h4 style={styles.decisionTitle}>Submit Decision</h4>
                  <div style={styles.decisionBtns}>
                    <button
                      style={{
                        ...styles.approveBtn,
                        ...(decision === 'approved' ? styles.approveBtnActive : {}),
                      }}
                      onClick={() => setDecision('approved')}
                    >✅ Approve</button>
                    <button
                      style={{
                        ...styles.rejectBtn,
                        ...(decision === 'rejected' ? styles.rejectBtnActive : {}),
                      }}
                      onClick={() => setDecision('rejected')}
                    >❌ Reject</button>
                  </div>
                  <textarea
                    style={styles.notesInput}
                    placeholder="Add notes (optional for approve, recommended for reject)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                  <button
                    style={{
                      ...styles.submitBtn,
                      ...(!decision || submitting ? styles.btnDisabled : {}),
                    }}
                    disabled={!decision || submitting}
                    onClick={handleSubmitDecision}
                  >
                    {submitting ? 'Submitting...' : 'Submit Decision'}
                  </button>
                </div>
              )}

              {/* Previous decision display */}
              {selectedItem.reviewDecision && (
                <div style={styles.previousDecision}>
                  <h4 style={styles.decisionTitle}>Decision</h4>
                  <p><strong>Result:</strong> {selectedItem.reviewDecision}</p>
                  {selectedItem.reviewNotes && <p><strong>Notes:</strong> {selectedItem.reviewNotes}</p>}
                  {selectedItem.reviewedAt && <p><strong>Reviewed:</strong> {formatDate(selectedItem.reviewedAt)}</p>}
                  {selectedItem.reviewedBy && <p><strong>Reviewer:</strong> {selectedItem.reviewedBy}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', padding: '24px 16px', background: 'var(--bg-primary, #0f172a)' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  header: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 800, color: '#e2e8f0', margin: '0 0 6px' },
  subtitle: { fontSize: '14px', color: '#94a3b8', margin: 0 },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: {
    padding: '10px 20px', fontSize: '13px', fontWeight: 600, color: '#94a3b8',
    background: 'rgba(148, 163, 184, 0.05)', border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease',
  },
  tabActive: { color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.3)' },
  errorBanner: {
    padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px',
    color: '#ef4444', fontSize: '14px', marginBottom: '16px',
  },
  content: { display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' as const },
  list: { flex: '1 1 360px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px' },
  loadingBox: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
  emptyBox: { textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '15px' },
  listItem: {
    padding: '16px', background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.08)', cursor: 'pointer', transition: 'all 0.2s ease',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  listItemSelected: { borderColor: '#8b5cf6', background: 'rgba(139, 92, 246, 0.08)' },
  listItemTop: { display: 'flex', alignItems: 'center', gap: '8px' },
  overdueBadge: {
    fontSize: '11px', fontWeight: 700, color: '#ef4444', padding: '2px 8px',
    background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px',
  },
  listItemMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' },
  listItemReason: { fontSize: '13px', color: '#94a3b8', lineHeight: 1.4 },
  listItemDate: { fontSize: '11px', color: '#475569' },
  decisionBadge: { fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', alignSelf: 'flex-start' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 0' },
  pageBtn: {
    padding: '6px 14px', fontSize: '13px', color: '#94a3b8',
    background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: '8px', cursor: 'pointer',
  },
  pageInfo: { fontSize: '12px', color: '#64748b' },
  detailPanel: {
    flex: '1 1 340px', minWidth: '300px', padding: '24px',
    background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)',
    borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.15)',
    display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky' as const, top: '24px',
  },
  detailTitle: { fontSize: '16px', fontWeight: 700, color: '#e2e8f0', margin: 0 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  detailField: { display: 'flex', flexDirection: 'column', gap: '3px' },
  detailLabel: { fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const },
  detailValue: { fontSize: '13px', color: '#e2e8f0' },
  decisionForm: { display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(148,163,184,0.1)' },
  decisionTitle: { fontSize: '14px', fontWeight: 600, color: '#e2e8f0', margin: 0 },
  decisionBtns: { display: 'flex', gap: '10px' },
  approveBtn: {
    flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600, color: '#64748b',
    background: 'rgba(148,163,184,0.05)', border: '2px solid rgba(148,163,184,0.1)',
    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease',
  },
  approveBtnActive: { color: '#10b981', borderColor: '#10b981', background: 'rgba(16,185,129,0.1)' },
  rejectBtn: {
    flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600, color: '#64748b',
    background: 'rgba(148,163,184,0.05)', border: '2px solid rgba(148,163,184,0.1)',
    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease',
  },
  rejectBtnActive: { color: '#ef4444', borderColor: '#ef4444', background: 'rgba(239,68,68,0.1)' },
  notesInput: {
    padding: '10px 14px', fontSize: '13px', color: '#e2e8f0', resize: 'vertical' as const,
    background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: '10px', outline: 'none', fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '12px', fontSize: '14px', fontWeight: 600, color: '#fff',
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    border: 'none', borderRadius: '10px', cursor: 'pointer',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  previousDecision: { fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 },
};
