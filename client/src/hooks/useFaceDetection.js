import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
const MODEL_URL = 'https://vladmandic.github.io/face-api/model';
// Eye Aspect Ratio — measures how open the eye is
// EAR < 0.2 means eyes are closed
function eyeAspectRatio(eye) {
  const a = dist(eye[1], eye[5]);
  const b = dist(eye[2], eye[4]);
  const c = dist(eye[0], eye[3]);
  return (a + b) / (2.0 * c);
}

// Mouth Aspect Ratio — measures how open the mouth is
// MAR > 0.6 means yawning
function mouthAspectRatio(mouth) {
  const a = dist(mouth[13], mouth[19]);
  const b = dist(mouth[14], mouth[18]);
  const c = dist(mouth[15], mouth[17]);
  const d = dist(mouth[12], mouth[16]);
  return (a + b + c) / (2.0 * d);
}

function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export default function useFaceDetection(videoRef, isActive, sensitivity = 3) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'focused' | 'distracted'
  const [distraction, setDistraction] = useState(null); // null | { type, message }
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const intervalRef = useRef(null);
  const noFaceCountRef = useRef(0);
  const alertsRef = useRef([]);

  // EAR/MAR thresholds adjusted by sensitivity (1–5)
  // Higher sensitivity = easier to trigger
  const EAR_THRESHOLD = 0.22 + (sensitivity - 3) * 0.02;  // ~0.18–0.26
  const MAR_THRESHOLD = 0.60 - (sensitivity - 3) * 0.04;  // ~0.68–0.52
  const NO_FACE_FRAMES = Math.max(3, 6 - sensitivity);     // 2–5 frames

  // Load face-api models
  useEffect(() => {
    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus('ready');
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        setStatus('error');
      }
    }
    loadModels();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const runDetection = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 });
      const result = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks(true);

      if (!result) {
        noFaceCountRef.current += 1;
        if (noFaceCountRef.current >= NO_FACE_FRAMES) {
          triggerDistraction('face_away', '👤 You looked away! Come back!');
        }
        return;
      }

      noFaceCountRef.current = 0;
      const landmarks = result.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const mouth = landmarks.getMouth();

      const leftEAR = eyeAspectRatio(leftEye);
      const rightEAR = eyeAspectRatio(rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2;
      const mar = mouthAspectRatio(mouth);

      if (avgEAR < EAR_THRESHOLD) {
        triggerDistraction('eyes_closed', '😴 Wake up! Your eyes are closing!');
      } else if (mar > MAR_THRESHOLD) {
        triggerDistraction('yawning', '😮 Yawning detected! Stay alert!');
      } else {
        clearDistraction();
      }
    } catch (err) {
      // Silent fail — detection continues
    }
  }, [videoRef, EAR_THRESHOLD, MAR_THRESHOLD, NO_FACE_FRAMES]);

  const triggerDistraction = (type, message) => {
    setStatus('distracted');
    setDistraction({ type, message });
    alertsRef.current.push({ type, timestamp: Date.now() });
  };

  const clearDistraction = () => {
    setStatus('focused');
    setDistraction(null);
    noFaceCountRef.current = 0;
  };

  // Start/stop detection loop
  useEffect(() => {
    if (!modelsLoaded || !isActive) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    intervalRef.current = setInterval(runDetection, 500); // check every 500ms
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [modelsLoaded, isActive, runDetection]);

  return {
    status,
    distraction,
    modelsLoaded,
    alerts: alertsRef.current,
  };
}
