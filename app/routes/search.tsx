import type { Route } from "./+types/search";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Buscar - App Móvil" },
    { name: "description", content: "Página de búsqueda" },
  ];
}

export default function Search() {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="shadow-sm border-b px-4 py-4" style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)' 
      }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Buscar</h1>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            className="block w-full pl-10 pr-3 py-3 rounded-lg focus:ring-2 focus:ring-opacity-50"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              '--tw-ring-color': 'var(--color-accent)',
              '--tw-ring-opacity': '0.5'
            } as React.CSSProperties & { '--tw-ring-color': string; '--tw-ring-opacity': string }}
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4 space-y-3">
        <div className="rounded-lg p-4 shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Resultado 1</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Descripción del resultado de búsqueda...</p>
        </div>
        
        <div className="rounded-lg p-4 shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Resultado 2</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Otro resultado de búsqueda interesante...</p>
        </div>
        
        <div className="rounded-lg p-4 shadow-sm border" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)' 
        }}>
          <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Resultado 3</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Más contenido para mostrar...</p>
        </div>
      </div>
    </div>
  );
}
