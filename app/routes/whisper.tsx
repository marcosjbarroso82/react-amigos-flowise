import type { Route } from "./+types/whisper";
import { useTheme } from "~/contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Whisper API - Prueba de Transcripción" },
    { name: "description", content: "Página para probar la API de Whisper de OpenAI" },
  ];
}

interface WhisperConfig {
  apiKey: string;
  model: string;
  language?: string;
}

export default function WhisperTest() {
  const { theme } = useTheme();
  const [config, setConfig] = useState<WhisperConfig>({
    apiKey: '',
    model: 'whisper-1',
    language: 'es'
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar configuración del localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('whisper-config');
    const savedApiKey = localStorage.getItem('openai-api-key');
    
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig({
        ...parsedConfig,
        apiKey: savedApiKey || parsedConfig.apiKey
      });
    } else if (savedApiKey) {
      setConfig(prev => ({ ...prev, apiKey: savedApiKey }));
    }
  }, []);

  // Guardar configuración en localStorage
  useEffect(() => {
    const configToSave = { ...config };
    delete configToSave.apiKey; // No guardar API key en whisper-config
    localStorage.setItem('whisper-config', JSON.stringify(configToSave));
  }, [config]);

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
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
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

  const transcribeAudio = async () => {
    if (!audioUrl || !config.apiKey) {
      setError('Por favor graba un audio y configura tu API Key de OpenAI');
      return;
    }

    setIsProcessing(true);
    setError('');
    setTranscription('');

    try {
      // Convertir URL a Blob
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();

      // Crear FormData para la API de Whisper
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      formData.append('model', config.model);
      if (config.language) {
        formData.append('language', config.language);
      }

      const apiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error?.message || 'Error en la transcripción');
      }

      const result = await apiResponse.json();
      setTranscription(result.text);

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

  const clearRecording = () => {
    setAudioUrl(null);
    setTranscription('');
    setError('');
    setRecordingDuration(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="shadow-sm border-b px-4 py-4" style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)' 
      }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Whisper API - Transcripción
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Prueba la API de transcripción de OpenAI
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Configuración */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Configuración
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                API Key de OpenAI
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => {
                  const apiKey = e.target.value;
                  setConfig({...config, apiKey});
                  localStorage.setItem('openai-api-key', apiKey);
                }}
                placeholder="sk-..."
                className="w-full p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Configura tu API Key en Configuración → OpenAI API
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Modelo
              </label>
              <select
                value={config.model}
                onChange={(e) => setConfig({...config, model: e.target.value})}
                className="w-full p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="whisper-1">whisper-1</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Idioma (opcional)
              </label>
              <select
                value={config.language || ''}
                onChange={(e) => setConfig({...config, language: e.target.value || undefined})}
                className="w-full p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">Auto-detectar</option>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="fr">Francés</option>
                <option value="de">Alemán</option>
                <option value="it">Italiano</option>
                <option value="pt">Portugués</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grabación */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Grabación de Audio
            </h2>
          </div>
          <div className="p-4">
            <div className="text-center space-y-4">
              {/* Botón de grabación */}
              <div className="flex justify-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: isRecording ? '#ef4444' : 'var(--color-accent)',
                    color: 'white'
                  }}
                >
                  {isRecording ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Duración */}
              {isRecording && (
                <div className="text-center">
                  <div className="text-2xl font-mono" style={{ color: 'var(--color-text-primary)' }}>
                    {formatTime(recordingDuration)}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Grabando...
                  </p>
                </div>
              )}

              {/* Audio player */}
              {audioUrl && !isRecording && (
                <div className="space-y-3">
                  <audio controls className="w-full">
                    <source src={audioUrl} type="audio/wav" />
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={transcribeAudio}
                      disabled={isProcessing || !config.apiKey}
                      className="flex-1 py-3 px-4 rounded-lg font-medium"
                      style={{
                        backgroundColor: config.apiKey ? 'var(--color-accent)' : 'var(--color-surface-secondary)',
                        color: config.apiKey ? 'white' : 'var(--color-text-tertiary)'
                      }}
                    >
                      {isProcessing ? 'Transcribiendo...' : 'Transcribir Audio'}
                    </button>
                    
                    <button
                      onClick={clearRecording}
                      className="px-4 py-3 rounded-lg border"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}

              {/* Instrucciones */}
              {!audioUrl && !isRecording && (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Presiona el botón para comenzar a grabar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resultado */}
        {(transcription || error) && (
          <div className="rounded-lg shadow-sm border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
              <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Resultado
              </h2>
            </div>
            <div className="p-4">
              {error && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                  <p className="text-sm" style={{ color: '#dc2626' }}>
                    {error}
                  </p>
                </div>
              )}
              
              {transcription && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
                  <p style={{ color: 'var(--color-text-primary)' }}>
                    {transcription}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Información
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <p className="mb-2">
                <strong>Whisper</strong> es un modelo de transcripción de audio de OpenAI que puede convertir audio a texto con alta precisión.
              </p>
              <p className="mb-2">
                <strong>Características:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Soporte para múltiples idiomas</li>
                <li>Transcripción precisa de audio</li>
                <li>Detección automática de idioma</li>
                <li>Procesamiento de archivos de audio</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
