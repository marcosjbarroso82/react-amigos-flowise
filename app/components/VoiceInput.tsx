import { useState, useRef, useEffect } from "react";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInput({ onTranscription, disabled = false, className = "" }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        transcribeAudio(audioBlob);
        
        // Detener todas las pistas de audio
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Error al acceder al micrófono: ' + (err as Error).message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    const apiKey = localStorage.getItem('openai-api-key');
    const language = localStorage.getItem('whisper-language') || undefined;

    if (!apiKey) {
      setError('Por favor configura tu API Key de OpenAI en Configuración');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Crear FormData para la API de Whisper
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      formData.append('model', 'whisper-1');
      if (language) {
        formData.append('language', language);
      }

      const apiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error?.message || 'Error en la transcripción');
      }

      const result = await apiResponse.json();
      onTranscription(result.text);

    } catch (err) {
      setError('Error en la transcripción: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isRecording ? 'animate-pulse' : ''
        } ${disabled || isProcessing ? 'opacity-50' : ''}`}
        style={{
          backgroundColor: isRecording ? '#ef4444' : 'var(--color-accent)',
          color: 'white'
        }}
        title={isRecording ? 'Detener grabación' : 'Iniciar grabación de voz'}
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        ) : isRecording ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        )}
      </button>

      {/* Indicador de duración */}
      {isRecording && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatTime(recordingDuration)}
        </div>
      )}

      {/* Error tooltip */}
      {error && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}
