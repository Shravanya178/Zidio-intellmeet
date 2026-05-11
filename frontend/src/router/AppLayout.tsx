import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar à venir */}
      <aside className="w-64 border-r border-border bg-sidebar" />

      {/* Contenu principal */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}