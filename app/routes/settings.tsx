import type { Route } from "./+types/settings";
import { useTheme } from "~/contexts/ThemeContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Configuración - App Móvil" },
    { name: "description", content: "Página de configuración" },
  ];
}

export default function Settings() {
  const { theme, setTheme } = useTheme();

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
