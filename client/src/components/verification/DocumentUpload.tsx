import { useState, useRef, useCallback } from 'react';

interface DocumentUploadProps {
  onUpload: (frontFile: File, backFile?: File) => void;
  requiresBack: boolean;
  isUploading: boolean;
}

export default function DocumentUpload({ onUpload, requiresBack, isUploading }: DocumentUploadProps) {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [dragOverFront, setDragOverFront] = useState(false);
  const [dragOverBack, setDragOverBack] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  const handleFile = useCallback((file: File, side: 'front' | 'back') => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB.');
      return;
    }

    if (side === 'front') {
      setFrontFile(file);
      if (file.type.startsWith('image/')) {
        setFrontPreview(URL.createObjectURL(file));
      } else {
        setFrontPreview(null);
      }
    } else {
      setBackFile(file);
      if (file.type.startsWith('image/')) {
        setBackPreview(URL.createObjectURL(file));
      } else {
        setBackPreview(null);
      }
    }
  }, []);

  const handleDrop = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault();
    side === 'front' ? setDragOverFront(false) : setDragOverBack(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, side);
  };

  const canSubmit = frontFile && (!requiresBack || backFile);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Front Side Upload */}
      <div>
        <label style={styles.label}>
          Front of Document <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div
          style={{
            ...styles.dropZone,
            ...(dragOverFront ? styles.dropZoneActive : {}),
            ...(frontPreview ? styles.dropZoneWithPreview : {}),
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOverFront(true); }}
          onDragLeave={() => setDragOverFront(false)}
          onDrop={(e) => handleDrop(e, 'front')}
          onClick={() => frontInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload front of document"
          onKeyDown={(e) => e.key === 'Enter' && frontInputRef.current?.click()}
        >
          {frontPreview ? (
            <img src={frontPreview} alt="Front preview" style={styles.previewImage} />
          ) : (
            <div style={styles.dropContent}>
              <div style={styles.uploadIcon}>📄</div>
              <p style={styles.dropText}>
                {frontFile ? frontFile.name : 'Drag & drop or click to upload'}
              </p>
              <p style={styles.dropHint}>JPEG, PNG, or PDF — Max 10MB</p>
            </div>
          )}
          <input
            ref={frontInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'front')}
          />
        </div>
      </div>

      {/* Back Side Upload */}
      {requiresBack && (
        <div>
          <label style={styles.label}>
            Back of Document <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div
            style={{
              ...styles.dropZone,
              ...(dragOverBack ? styles.dropZoneActive : {}),
              ...(backPreview ? styles.dropZoneWithPreview : {}),
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOverBack(true); }}
            onDragLeave={() => setDragOverBack(false)}
            onDrop={(e) => handleDrop(e, 'back')}
            onClick={() => backInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload back of document"
            onKeyDown={(e) => e.key === 'Enter' && backInputRef.current?.click()}
          >
            {backPreview ? (
              <img src={backPreview} alt="Back preview" style={styles.previewImage} />
            ) : (
              <div style={styles.dropContent}>
                <div style={styles.uploadIcon}>📄</div>
                <p style={styles.dropText}>
                  {backFile ? backFile.name : 'Drag & drop or click to upload'}
                </p>
                <p style={styles.dropHint}>JPEG, PNG, or PDF — Max 10MB</p>
              </div>
            )}
            <input
              ref={backInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'back')}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        style={{
          ...styles.submitBtn,
          ...((!canSubmit || isUploading) ? styles.submitBtnDisabled : {}),
        }}
        disabled={!canSubmit || isUploading}
        onClick={() => frontFile && onUpload(frontFile, backFile || undefined)}
        aria-label="Upload document"
      >
        {isUploading ? (
          <span style={styles.loadingSpinner}>⏳</span>
        ) : (
          'Upload & Verify Document'
        )}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary, #e2e8f0)',
    marginBottom: '8px',
  },
  dropZone: {
    border: '2px dashed rgba(139, 92, 246, 0.3)',
    borderRadius: '16px',
    padding: '40px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(139, 92, 246, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  dropZoneActive: {
    borderColor: '#8b5cf6',
    background: 'rgba(139, 92, 246, 0.15)',
    transform: 'scale(1.02)',
  },
  dropZoneWithPreview: {
    padding: '8px',
  },
  dropContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  uploadIcon: {
    fontSize: '40px',
    marginBottom: '8px',
  },
  dropText: {
    fontSize: '15px',
    color: 'var(--text-primary, #e2e8f0)',
    fontWeight: 500,
    margin: 0,
  },
  dropHint: {
    fontSize: '13px',
    color: 'var(--text-secondary, #94a3b8)',
    margin: 0,
  },
  previewImage: {
    width: '100%',
    maxHeight: '240px',
    objectFit: 'contain',
    borderRadius: '12px',
  },
  submitBtn: {
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loadingSpinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
};
