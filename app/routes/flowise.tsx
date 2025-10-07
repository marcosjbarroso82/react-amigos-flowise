import type { Route } from "./+types/flowise";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Flowise - App Móvil" },
    { name: "description", content: "Página para probar endpoints de Flowise" },
  ];
}

interface FlowiseEndpoint {
  id: string;
  name: string;
  url: string;
  description?: string;
}

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

export default function Flowise() {
  const [endpoints, setEndpoints] = useState<FlowiseEndpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [testData, setTestData] = useState<string>("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar endpoints guardados del localStorage
  useEffect(() => {
    const savedEndpoints = localStorage.getItem('flowise-endpoints');
    if (savedEndpoints) {
      setEndpoints(JSON.parse(savedEndpoints));
    }
  }, []);

  const handleTestEndpoint = async () => {
    if (!selectedEndpoint || !testData.trim()) {
      alert('Por favor selecciona un endpoint y proporciona datos de prueba');
      return;
    }

    const endpoint = endpoints.find(ep => ep.id === selectedEndpoint);
    if (!endpoint) return;

    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: testData,
      });

      const data = await response.json();
      
      setTestResult({
        success: response.ok,
        data: data,
        status: response.status,
        error: response.ok ? undefined : data.message || 'Error desconocido'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEndpointData = endpoints.find(ep => ep.id === selectedEndpoint);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="shadow-sm border-b px-4 py-4" style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)' 
      }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Flowise</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Prueba endpoints de Flowise
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Selección de Endpoint */}
        <div className="rounded-lg shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Seleccionar Endpoint
            </h2>
          </div>
          <div className="p-4">
            {endpoints.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  No hay endpoints configurados
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Ve a Configuración para agregar endpoints de Flowise
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Selecciona un endpoint</option>
                  {endpoints.map((endpoint) => (
                    <option key={endpoint.id} value={endpoint.id}>
                      {endpoint.name}
                    </option>
                  ))}
                </select>
                
                {selectedEndpointData && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      URL: {selectedEndpointData.url}
                    </p>
                    {selectedEndpointData.description && (
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {selectedEndpointData.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Formulario de Prueba */}
        {selectedEndpoint && (
          <div className="rounded-lg shadow-sm border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
              <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Datos de Prueba
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  JSON de entrada
                </label>
                <textarea
                  value={testData}
                  onChange={(e) => setTestData(e.target.value)}
                  placeholder='{"question": "¿Cómo estás?", "chatId": "test-123"}'
                  rows={6}
                  className="w-full p-3 rounded-lg border resize-none"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              
              <button
                onClick={handleTestEndpoint}
                disabled={isLoading || !testData.trim()}
                className="w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white'
                }}
              >
                {isLoading ? 'Probando...' : 'Probar Endpoint'}
              </button>
            </div>
          </div>
        )}

        {/* Resultados */}
        {testResult && (
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
              <div className={`p-3 rounded-lg mb-4 ${
                testResult.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center">
                  <svg className={`w-5 h-5 mr-2 ${
                    testResult.success ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {testResult.success ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span className={`font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.success ? 'Éxito' : 'Error'}
                  </span>
                  {testResult.status && (
                    <span className={`ml-2 text-sm ${
                      testResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      (Status: {testResult.status})
                    </span>
                  )}
                </div>
                {testResult.error && (
                  <p className="text-red-700 text-sm mt-1">{testResult.error}</p>
                )}
              </div>
              
              {testResult.data && (
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Respuesta:
                  </h3>
                  <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{ 
                    backgroundColor: 'var(--color-surface-secondary)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
