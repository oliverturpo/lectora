import { useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * Hook para escanear códigos de barras usando la cámara del dispositivo
 * Optimizado para cámara trasera en móviles
 */
export function useBarcodeScanner(onScanSuccess) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const lastScanRef = useRef('');
  const lastScanTimeRef = useRef(0);

  // Iniciar escaneo
  const startScanning = useCallback(async () => {
    setError(null);

    try {
      // Verificar que el contenedor existe
      const container = document.getElementById('barcode-scanner');
      if (!container) {
        throw new Error('Contenedor de cámara no encontrado');
      }

      // Limpiar scanner anterior si existe
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // Ignorar error al detener
        }
        scannerRef.current = null;
      }

      // Crear instancia del scanner
      scannerRef.current = new Html5Qrcode('barcode-scanner');

      // Callback cuando detecta un código
      const onScanSuccessCallback = (decodedText) => {
        const now = Date.now();

        // Evitar escaneos duplicados (mismo código en menos de 2 segundos)
        if (decodedText === lastScanRef.current && now - lastScanTimeRef.current < 2000) {
          return;
        }

        lastScanRef.current = decodedText;
        lastScanTimeRef.current = now;

        // Validar que sea un DNI (8 dígitos)
        const cleanCode = decodedText.trim();
        if (/^\d{8}$/.test(cleanCode)) {
          onScanSuccess(cleanCode);
        }
      };

      // Configuración simplificada - usar facingMode para cámara trasera
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
      };

      // Iniciar con cámara trasera usando facingMode
      await scannerRef.current.start(
        { facingMode: "environment" }, // environment = cámara trasera
        config,
        onScanSuccessCallback,
        () => {} // Ignorar errores de frames individuales
      );

      setIsScanning(true);

    } catch (err) {
      console.error('Error completo:', err);

      // Construir mensaje de error más descriptivo
      let errorMsg = 'Error desconocido';

      if (err) {
        if (typeof err === 'string') {
          errorMsg = err;
        } else if (err.message) {
          errorMsg = err.message;
        } else if (err.name) {
          errorMsg = err.name;
        } else {
          errorMsg = JSON.stringify(err);
        }
      }

      // Detectar errores comunes
      if (errorMsg.includes('Permission') || errorMsg.includes('permission') || errorMsg.includes('NotAllowedError')) {
        setError('Permiso de cámara denegado. Permite el acceso a la cámara en la configuración del navegador.');
      } else if (errorMsg.includes('NotFoundError') || errorMsg.includes('not found')) {
        setError('No se encontró ninguna cámara en el dispositivo.');
      } else if (errorMsg.includes('NotReadableError') || errorMsg.includes('Could not start')) {
        setError('La cámara está siendo usada por otra aplicación.');
      } else if (errorMsg.includes('OverconstrainedError')) {
        setError('La cámara no soporta la configuración solicitada.');
      } else if (errorMsg.includes('SecurityError') || errorMsg.includes('secure context') || errorMsg.includes('HTTPS')) {
        setError('Se requiere HTTPS para usar la cámara. Habilita la flag en chrome://flags');
      } else {
        setError('Error de cámara: ' + errorMsg);
      }

      setIsScanning(false);
    }
  }, [onScanSuccess]);

  // Detener escaneo
  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error deteniendo scanner:', err);
      }
    }
    setIsScanning(false);
  }, []);

  return {
    isScanning,
    error,
    startScanning,
    stopScanning,
  };
}

export default useBarcodeScanner;
