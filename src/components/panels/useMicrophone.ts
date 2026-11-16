import {useEffect, useRef, useState} from 'react';

export function useMicrophone<T extends string>() {
  const [target, setTarget] = useState<T | null>(null);
  const request = useRef<symbol | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const release = useRef<(() => void) | null>(null);

  useEffect(() => () => {
    request.current = null;
    release.current?.();
  }, []);

  async function start(which: T, onStart: () => void, onRecorded: (blob: Blob) => void, onError: () => void) {
    if (request.current) return;
    const id = Symbol();
    request.current = id;
    setTarget(which);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const stopTracks = () => stream.getTracks().forEach(track => track.stop());
      if (request.current !== id) {
        stopTracks();
        return;
      }
      release.current = stopTracks;
      const media = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.current = media;
      release.current = () => {
        media.ondataavailable = null;
        media.onstop = null;
        media.onerror = null;
        try {
          if (media.state !== 'inactive') media.stop();
        } catch {
          // A recorder may already be stopping when its panel unmounts.
        } finally {
          stopTracks();
          recorder.current = null;
          release.current = null;
        }
      };
      const finish = () => {
        release.current?.();
        request.current = null;
        setTarget(null);
      };
      media.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      media.onstop = () => {
        if (request.current !== id) return;
        finish();
        onRecorded(new Blob(chunks, {type: media.mimeType || 'audio/webm'}));
      };
      media.onerror = () => {
        if (request.current !== id) return;
        finish();
        onError();
      };
      media.start();
      onStart();
    } catch {
      if (request.current !== id) return;
      release.current?.();
      release.current = null;
      request.current = null;
      setTarget(null);
      onError();
    }
  }

  function stop() {
    if (recorder.current?.state === 'recording') recorder.current.stop();
    else if (!recorder.current) {
      request.current = null;
      setTarget(null);
    }
  }

  return {target, start, stop};
}
