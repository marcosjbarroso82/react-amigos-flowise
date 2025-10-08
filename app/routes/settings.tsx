import type { Route } from "./+types/settings";
import { useTheme } from "~/contexts/ThemeContext";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Configuración - App Móvil" },
    { name: "description", content: "Página de configuración" },
  ];
}

interface FlowiseEndpoint {
  id: string;
  name: string;
  url: string;
  description?: string;
  apiKey?: string;
}

interface ChatHistoryConfig {
  historyMode: 'client' | 'server';
  autoLoadHistory: boolean;
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [endpoints, setEndpoints] = useState<FlowiseEndpoint[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    url: '',
    description: '',
    apiKey: ''
  });
  const [historyConfig, setHistoryConfig] = useState<ChatHistoryConfig>({
    historyMode: 'client',
    autoLoadHistory: true
  });

  // Cargar datos del localStorage
  useEffect(() => {
    const savedEndpoints = localStorage.getItem('flowise-endpoints');
    const savedHistoryConfig = localStorage.getItem('flowise-history-config');
    
    if (savedEndpoints) {
      setEndpoints(JSON.parse(savedEndpoints));
    }
    if (savedHistoryConfig) {
      setHistoryConfig(JSON.parse(savedHistoryConfig));
    }
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('flowise-endpoints', JSON.stringify(endpoints));
  }, [endpoints]);

  useEffect(() => {
    localStorage.setItem('flowise-history-config', JSON.stringify(historyConfig));
  }, [historyConfig]);

  const handleAddEndpoint = () => {
    if (!newEndpoint.name.trim() || !newEndpoint.url.trim()) {
      alert('Por favor completa el nombre y URL del endpoint');
      return;
    }

    const endpoint: FlowiseEndpoint = {
      id: Date.now().toString(),
      name: newEndpoint.name.trim(),
      url: newEndpoint.url.trim(),
      description: newEndpoint.description.trim() || undefined,
      apiKey: newEndpoint.apiKey.trim() || undefined
    };

    setEndpoints([...endpoints, endpoint]);
    setNewEndpoint({ name: '', url: '', description: '', apiKey: '' });
    setShowAddForm(false);
  };

  const handleDeleteEndpoint = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este endpoint?')) {
      setEndpoints(endpoints.filter(ep => ep.id !== id));
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="shadow-sm border-b px-4 py-4" style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)' 
      }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Configuración</h1>
      </div>

      {/* Settings Sections */}
      <div className="p-4 space-y-4">
        {/* Notifications */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Notificaciones</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            <div className="px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--color-text-primary)' }}>Push Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderColor: 'var(--color-border)',
                    '--tw-ring-color': 'var(--color-accent)',
                    '--tw-ring-opacity': '0.3'
                  } as React.CSSProperties & { '--tw-ring-color': string; '--tw-ring-opacity': string }}
                ></div>
              </label>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--color-text-primary)' }}>Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderColor: 'var(--color-border)',
                    '--tw-ring-color': 'var(--color-accent)',
                    '--tw-ring-opacity': '0.3'
                  } as React.CSSProperties & { '--tw-ring-color': string; '--tw-ring-opacity': string }}
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Apariencia</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            <div className="px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--color-text-primary)' }}>Tema</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    theme === 'light' 
                      ? 'text-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{
                    backgroundColor: theme === 'light' ? 'var(--color-accent)' : 'transparent',
                    color: theme === 'light' ? 'white' : 'var(--color-text-secondary)'
                  }}
                >
                  Claro
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    theme === 'dark' 
                      ? 'text-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--color-accent)' : 'transparent',
                    color: theme === 'dark' ? 'white' : 'var(--color-text-secondary)'
                  }}
                >
                  Oscuro
                </button>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--color-text-primary)' }}>Tamaño de fuente</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>Medio</span>
            </div>
          </div>
        </div>

        {/* Flowise Endpoints */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Endpoints de Flowise</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {endpoint.name}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {endpoint.url}
                  </div>
                  {endpoint.description && (
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      {endpoint.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteEndpoint(endpoint.id)}
                  className="ml-3 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            
            {endpoints.length === 0 && (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  No hay endpoints configurados
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Agrega endpoints para probarlos en la página de Flowise
                </p>
              </div>
            )}

            <div className="px-4 py-3">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2 px-4 rounded-lg border-2 border-dashed transition-colors"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Endpoint
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={newEndpoint.name}
                      onChange={(e) => setNewEndpoint({...newEndpoint, name: e.target.value})}
                      placeholder="Mi Endpoint de Flowise"
                      className="w-full p-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-surface-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      URL
                    </label>
                    <input
                      type="url"
                      value={newEndpoint.url}
                      onChange={(e) => setNewEndpoint({...newEndpoint, url: e.target.value})}
                      placeholder="https://mi-flowise.com/api/v1/prediction/..."
                      className="w-full p-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-surface-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      value={newEndpoint.description}
                      onChange={(e) => setNewEndpoint({...newEndpoint, description: e.target.value})}
                      placeholder="Descripción del endpoint"
                      className="w-full p-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-surface-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      API Key (opcional)
                    </label>
                    <input
                      type="password"
                      value={newEndpoint.apiKey}
                      onChange={(e) => setNewEndpoint({...newEndpoint, apiKey: e.target.value})}
                      placeholder="API Key para autenticación"
                      className="w-full p-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-surface-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Requerido para cargar historial desde el servidor
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddEndpoint}
                      className="flex-1 py-2 px-4 rounded-lg font-medium"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'white'
                      }}
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewEndpoint({ name: '', url: '', description: '', apiKey: '' });
                      }}
                      className="flex-1 py-2 px-4 rounded-lg border"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat History Configuration */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Configuración de Chats</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: 'var(--color-text-primary)' }}>Manejo del Historial</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="historyMode"
                      value="client"
                      checked={historyConfig.historyMode === 'client'}
                      onChange={(e) => setHistoryConfig({...historyConfig, historyMode: e.target.value as 'client' | 'server'})}
                      className="mr-2"
                    />
                    <span style={{ color: 'var(--color-text-primary)' }}>Cliente (enviar historial completo)</span>
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="historyMode"
                      value="server"
                      checked={historyConfig.historyMode === 'server'}
                      onChange={(e) => setHistoryConfig({...historyConfig, historyMode: e.target.value as 'client' | 'server'})}
                      className="mr-2"
                    />
                    <span style={{ color: 'var(--color-text-primary)' }}>Servidor (solo chatId)</span>
                  </label>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  {historyConfig.historyMode === 'client' 
                    ? 'Se envía todo el historial en cada mensaje. Más confiable pero usa más ancho de banda.'
                    : 'Solo se envía el chatId. Más eficiente pero requiere que el servidor mantenga el historial.'
                  }
                </p>
              </div>
            </div>
            
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <span style={{ color: 'var(--color-text-primary)' }}>Cargar historial automáticamente</span>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Al usar un chatId existente, cargar el historial desde el servidor
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={historyConfig.autoLoadHistory}
                  onChange={(e) => setHistoryConfig({...historyConfig, autoLoadHistory: e.target.checked})}
                />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: historyConfig.autoLoadHistory ? 'var(--color-accent)' : 'var(--color-surface-secondary)',
                    borderColor: 'var(--color-border)',
                    '--tw-ring-color': 'var(--color-accent)',
                    '--tw-ring-opacity': '0.3'
                  } as React.CSSProperties & { '--tw-ring-color': string; '--tw-ring-opacity': string }}
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Privacidad</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            <div className="px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--color-text-primary)' }}>Compartir datos de uso</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderColor: 'var(--color-border)',
                    '--tw-ring-color': 'var(--color-accent)',
                    '--tw-ring-opacity': '0.3'
                  } as React.CSSProperties & { '--tw-ring-color': string; '--tw-ring-opacity': string }}
                ></div>
              </label>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--color-text-primary)' }}>Permitir seguimiento</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderColor: 'var(--color-border)',
                    '--tw-ring-color': 'var(--color-accent)',
                    '--tw-ring-opacity': '0.3'
                  } as React.CSSProperties & { '--tw-ring-color': string; '--tw-ring-opacity': string }}
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Acerca de</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            <div className="px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--color-text-primary)' }}>Versión</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>1.0.0</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--color-text-primary)' }}>Términos de Servicio</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--color-text-primary)' }}>Política de Privacidad</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
