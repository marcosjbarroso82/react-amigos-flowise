import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inicio - App Móvil" },
    { name: "description", content: "Página principal de la aplicación móvil" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="shadow-sm border-b px-4 py-4" style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)' 
      }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Bienvenido</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Tu aplicación móvil</p>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>Acciones Rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-4 shadow-sm border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--color-accent)' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Nuevo</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Crear algo nuevo</p>
          </div>
          
          <div className="rounded-lg p-4 shadow-sm border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: '#10b981' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Completar</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Ver tareas</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4">
        <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>Actividad Reciente</h2>
        <div className="space-y-3">
          <div className="rounded-lg p-4 shadow-sm border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Nueva actualización disponible</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Hace 2 horas</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg p-4 shadow-sm border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Tarea completada</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Ayer</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg p-4 shadow-sm border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Recordatorio pendiente</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Hace 3 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
