interface VerificationStatusProps {
  status: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '⏳' },
  document_uploaded: { label: 'Document Uploaded', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: '📄' },
  face_captured: { label: 'Face Captured', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: '📸' },
  processing: { label: 'Processing', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: '⚙️' },
  passed: { label: 'Verified', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: '✅' },
  failed: { label: 'Failed', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: '❌' },
  manual_review: { label: 'Under Review', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '👁️' },
  locked: { label: 'Locked', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: '🔒' },
};

const SIZES = {
  sm: { fontSize: '12px', padding: '4px 10px', gap: '4px' },
  md: { fontSize: '13px', padding: '6px 14px', gap: '6px' },
  lg: { fontSize: '15px', padding: '8px 18px', gap: '8px' },
};

export default function VerificationStatus({ status, size = 'md' }: VerificationStatusProps) {
  const config = status ? STATUS_CONFIG[status] : null;
  if (!config) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', ...SIZES[size],
        borderRadius: '20px', fontWeight: 600,
        color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)',
      }}>
        Not Verified
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: SIZES[size].gap,
      padding: SIZES[size].padding, borderRadius: '20px',
      fontSize: SIZES[size].fontSize, fontWeight: 600,
      color: config.color, background: config.bg,
    }}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
