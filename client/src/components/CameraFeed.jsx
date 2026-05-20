import { useEffect, useRef, forwardRef } from 'react';

const CameraFeed = forwardRef(function CameraFeed({ onStreamReady, onError }, ref) {
  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (ref.current) {
          ref.current.srcObject = stream;
          onStreamReady?.(stream);
        }
      } catch (err) {
        console.error('Camera error:', err);
        onError?.(err.message);
      }
    }

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scaleX(-1)', // mirror effect
        display: 'block',
      }}
    />
  );
});

export default CameraFeed;
