import { useState, useRef, useCallback, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  isProcessing: boolean;
}

const CHALLENGES = [
  { instruction: 'Look straight at the camera', icon: '👀' },
  { instruction: 'Slowly turn your head to the right', icon: '➡️' },
  { instruction: 'Now turn your head to the left', icon: '⬅️' },
  { instruction: 'Blink twice slowly', icon: '😑' },
  { instruction: 'Smile for the camera', icon: '😊' },
];

export default function CameraCapture({ onCapture, isProcessing }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access was denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Failed to access camera. Please try again.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Advance through liveness challenges
  const advanceChallenge = () => {
    if (challengeIdx < CHALLENGES.length - 1) {
      setChallengeIdx((i) => i + 1);
    } else {
      setChallengeComplete(true);
    }
  };

  // Capture photo with countdown
  const startCapture = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      captureFrame();
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
    }, 'image/jpeg', 0.9);
  };

  const retake = () => {
    setCapturedImage(null);
    setChallengeIdx(0);
    setChallengeComplete(false);
    startCamera();
  };

  const currentChallenge = CHALLENGES[challengeIdx];

  return (
    <div style={styles.container}>
      {/* Camera not started yet */}
      {!cameraActive && !capturedImage && !cameraError && (
        <div style={styles.startContainer}>
          <div style={styles.cameraIcon}>📸</div>
          <h3 style={styles.heading}>Face Verification</h3>
          <p style={styles.subtitle}>
            We'll need to verify your face matches your ID document.
            Please ensure good lighting and remove glasses if possible.
          </p>
          <button style={styles.primaryBtn} onClick={startCamera}>
            Open Camera
          </button>
        </div>
      )}

      {/* Camera error */}
      {cameraError && (
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{cameraError}</p>
          <button style={styles.primaryBtn} onClick={startCamera}>
            Try Again
          </button>
        </div>
      )}

      {/* Camera active — liveness challenges */}
      {cameraActive && !capturedImage && (
        <div style={styles.cameraContainer}>
          {/* Challenge prompt */}
          <div style={styles.challengeBanner}>
            <span style={styles.challengeIcon}>{currentChallenge.icon}</span>
            <span style={styles.challengeText}>{currentChallenge.instruction}</span>
            <span style={styles.challengeProgress}>
              {challengeIdx + 1}/{CHALLENGES.length}
            </span>
          </div>

          {/* Video feed */}
          <div style={styles.videoWrapper}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.video}
            />
            {/* Face oval guide */}
            <div style={styles.faceGuide} />
            {/* Countdown overlay */}
            {countdown !== null && (
              <div style={styles.countdownOverlay}>
                <span style={styles.countdownNumber}>{countdown}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            {!challengeComplete ? (
              <button style={styles.secondaryBtn} onClick={advanceChallenge}>
                ✓ Done — Next
              </button>
            ) : (
              <button style={styles.captureBtn} onClick={startCapture}>
                {countdown !== null ? `Capturing in ${countdown}...` : '📷 Capture Selfie'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Captured image preview */}
      {capturedImage && (
        <div style={styles.previewContainer}>
          <img src={capturedImage} alt="Captured selfie" style={styles.previewImage} />
          {isProcessing ? (
            <div style={styles.processingBadge}>
              <span style={styles.spinner}>⏳</span> Processing...
            </div>
          ) : (
            <button style={styles.retakeBtn} onClick={retake}>
              🔄 Retake Photo
            </button>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  startContainer: { textAlign: 'center', padding: '40px 20px' },
  cameraIcon: { fontSize: '56px', marginBottom: '16px' },
  heading: { fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #e2e8f0)', margin: '0 0 8px' },
  subtitle: { fontSize: '14px', color: 'var(--text-secondary, #94a3b8)', maxWidth: '360px', margin: '0 auto 24px', lineHeight: 1.6 },
  primaryBtn: {
    padding: '14px 32px', fontSize: '15px', fontWeight: 600, color: '#fff',
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease',
  },
  errorContainer: { textAlign: 'center', padding: '40px 20px' },
  errorIcon: { fontSize: '48px', marginBottom: '12px' },
  errorText: { fontSize: '15px', color: '#ef4444', marginBottom: '20px' },
  cameraContainer: { width: '100%', maxWidth: '480px' },
  challengeBanner: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
    background: 'rgba(139, 92, 246, 0.15)', borderRadius: '12px', marginBottom: '12px',
  },
  challengeIcon: { fontSize: '24px' },
  challengeText: { flex: 1, fontSize: '14px', fontWeight: 500, color: 'var(--text-primary, #e2e8f0)' },
  challengeProgress: { fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 },
  videoWrapper: { position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' },
  video: { width: '100%', display: 'block', transform: 'scaleX(-1)' },
  faceGuide: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: '200px', height: '260px', border: '3px solid rgba(139, 92, 246, 0.6)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  countdownOverlay: {
    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.5)',
  },
  countdownNumber: { fontSize: '72px', fontWeight: 800, color: '#fff' },
  controls: { display: 'flex', justifyContent: 'center', marginTop: '16px' },
  secondaryBtn: {
    padding: '12px 28px', fontSize: '14px', fontWeight: 600, color: '#8b5cf6',
    background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease',
  },
  captureBtn: {
    padding: '14px 32px', fontSize: '15px', fontWeight: 600, color: '#fff',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease',
  },
  previewContainer: { textAlign: 'center', maxWidth: '480px', width: '100%' },
  previewImage: { width: '100%', borderRadius: '16px', marginBottom: '16px', transform: 'scaleX(-1)' },
  processingBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
    background: 'rgba(139, 92, 246, 0.15)', borderRadius: '10px',
    fontSize: '14px', fontWeight: 500, color: '#8b5cf6',
  },
  spinner: { display: 'inline-block', animation: 'spin 1s linear infinite' },
  retakeBtn: {
    padding: '12px 24px', fontSize: '14px', fontWeight: 600, color: '#94a3b8',
    background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px', cursor: 'pointer',
  },
};
