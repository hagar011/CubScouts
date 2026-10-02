/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A highly robust, memory-leak free Speech Recognitiشon hook
 * that accepts an onResult callback and cleans up all active listeners.
 */
export function useSpeechRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'ar-EG';

    rec.onresult = (event: any) => {
      const lastIndex = event.results.length - 1;
      const result = event.results[lastIndex];
      if (result && result[0]) {
        onResult(result[0].transcript);
      }
    };

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (err: any) => {
      console.error('Speech recognition error:', err);
      setListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { /* ignore */ }
      }
    };
  }, [onResult]);

  const start = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Failed to stop speech recognition:', e);
      }
    }
  }, []);

  return {
    listening,
    start,
    stop,
  };
}

/**
 * A robust, memory-leak free Voice Recorder hook that records audio 
 * and stores the base64 output correctly for Firestore storage.
 */
export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [base64, setBase64] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    chunksRef.current = [];
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Microphone access is not available in this environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setBase64(reader.result as string);
        };
        
        // Stop all tracks to release resource
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Failed to stop recording:', e);
      }
      setRecording(false);
    }
  }, []);

  const clear = useCallback(() => {
    setBase64(null);
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch { /* ignore */ }
      }
    };
  }, []);

  return {
    recording,
    base64,
    start,
    stop,
    clear,
  };
}
