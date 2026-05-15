import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'
interface Toast { id: string; type: ToastType; message: string }
interface ToastCtx { toast: (type: ToastType, message: string, ms?: number) => void }

const Ctx = createContext<ToastCtx>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

const icons = {
  success: <CheckCircle2 size={16} />,
  error:   <AlertCircle  size={16} />,
  info:    <Info         size={16} />,
  warning: <AlertTriangle size={16} />,
}
const styles: Record<ToastType, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300',
  error:   'bg-red-50    dark:bg-red-900/20    border-red-200    dark:border-red-800/40    text-red-700    dark:text-red-300',
  info:    'bg-blue-50   dark:bg-blue-900/20   border-blue-200   dark:border-blue-800/40   text-blue-700   dark:text-blue-300',
  warning: 'bg-amber-50  dark:bg-amber-900/20  border-amber-200  dark:border-amber-800/40  text-amber-700  dark:text-amber-300',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((type: ToastType, message: string, ms = 4000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((p) => [...p, { id, type, message }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), ms)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-80 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl animate-in slide-in-from-right-4 duration-300 ${styles[t.type]}`}
          >
            <span className="shrink-0">{icons[t.type]}</span>
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
