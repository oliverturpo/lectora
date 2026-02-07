import { useCallback, useRef } from 'react';

// Hook para generar sonidos de feedback usando Web Audio API
export function useSound() {
  const audioContextRef = useRef(null);

  // Inicializar AudioContext (lazy loading)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Sonido de exito - "Perfect!" melodico
  const playSuccess = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Crear osciladores para un sonido melodico tipo "ding-ding"
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (acorde mayor)

      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);

        // Envelope ADSR
        gainNode.gain.setValueAtTime(0, now + index * 0.08);
        gainNode.gain.linearRampToValueAtTime(0.3, now + index * 0.08 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.4);

        oscillator.start(now + index * 0.08);
        oscillator.stop(now + index * 0.08 + 0.5);
      });

      // Agregar un tono final mas brillante
      const finalOsc = ctx.createOscillator();
      const finalGain = ctx.createGain();
      finalOsc.connect(finalGain);
      finalGain.connect(ctx.destination);
      finalOsc.type = 'sine';
      finalOsc.frequency.setValueAtTime(1046.50, now + 0.25); // C6
      finalGain.gain.setValueAtTime(0, now + 0.25);
      finalGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
      finalGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      finalOsc.start(now + 0.25);
      finalOsc.stop(now + 0.8);

    } catch (error) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  // Sonido de error/rechazo - tono descendente
  const playError = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Crear un sonido de "buzzer" descendente
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square'; // Sonido mas duro
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.linearRampToValueAtTime(200, now + 0.3);

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.35);

      // Segundo tono de error
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(300, now + 0.15);
      osc2.frequency.linearRampToValueAtTime(150, now + 0.4);
      gain2.gain.setValueAtTime(0.15, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.45);

    } catch (error) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  // Sonido de tardanza - tono de advertencia
  const playWarning = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Doble beep de advertencia
      [0, 0.15].forEach((delay) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, now + delay);

        gainNode.gain.setValueAtTime(0, now + delay);
        gainNode.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);

        oscillator.start(now + delay);
        oscillator.stop(now + delay + 0.12);
      });

    } catch (error) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  // Sonido de notificacion simple
  const playNotification = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      oscillator.start(now);
      oscillator.stop(now + 0.25);

    } catch (error) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  return {
    playSuccess,
    playError,
    playWarning,
    playNotification,
  };
}

export default useSound;
