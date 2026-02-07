import { useRef, useEffect, useCallback, useState } from 'react';
import { WS_URL } from '../config/constants';

export function useWebSocket(onMessage) {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    ws.current = new WebSocket(`${WS_URL}/attendance/`);

    ws.current.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      console.log('WebSocket conectado');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage?.(data);
      } catch (error) {
        console.error('Error parseando mensaje WS:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      console.log('WebSocket desconectado, reconectando...');

      // Reconectar despues de 3 segundos
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('Error WebSocket:', error);
      setConnectionStatus('error');
    };
  }, [onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket no conectado');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    connect,
    disconnect,
  };
}
