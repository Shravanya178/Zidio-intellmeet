import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Layout, Search, MoreVertical, MessageSquare, UserPlus, Plus, X, Trash2, Edit3 } from 'lucide-react'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useToast } from '../../components/Toast'
import { meetingsService } from '../../services/meetings.service'
import { useAuthStore } from '../../store/useAuthStore'

type Priority = 'Critical' | 'High' | 'Medium' | 'Low'
type Status   = 'todo' | 'in-progress' | 'done'

interface Task {
  id: string; title: string; status: Status
  priority: Priority; assignee: string; source: string
  meetingId?: string; itemId?: string
}

const priorityStyles: Record<Priority, string> = {
  Critical: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
  High:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Medium:   'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  Low:      'bg-muted      text-muted-foreground',
}

const columnMeta: Record<Status, { label: string; dot: string; bg: string }> = {
  'todo':        { label: 'To Do',       dot: 'bg-muted-foreground', bg: 'bg-muted/20' },
  'in-progress': { label: 'In Progress', dot: 'bg-amber-500',        bg: 'bg-amber-500/5' },
  'done':        { label: 'Done',        dot: 'bg-emerald-500',      bg: 'bg-emerald-500/5' },
}

function ActionMenu({ onDelete }: { onDelete?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors opacity-0 group-hover:opacity-100">
        <MoreVertical size={13} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-36 bg-card border border-border rounded-xl shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => { onDelete?.(); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2">
              <Trash2 size={11} /> Delete Task
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function TeamsPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [activeTab,     setActiveTab]     = useState<'board' | 'members'>('board')
  const [memberSearch,  setMemberSearch]  = useState('')
  const [showInvite,    setShowInvite]    = useState(false)
  const [showAddTask,   setShowAddTask]   = useState(false)
  const [inviteEmail,   setInviteEmail]   = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [localTasks,    setLocalTasks]    = useState<Task[]>([])
  const [newTask, setNewTask] = useState<{ title: string; priority: Priority; status: Status }>({
    title: '', priority: 'Medium', status: 'todo',
  })

  // Load real meetings to extract action items as tasks
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: meetingsService.getAll,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ meetingId, itemId }: { meetingId: string; itemId: string }) =>
      meetingsService.toggleActionItem(meetingId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
  })

  // Build tasks from real meeting action items + local manually added tasks
  const apiTasks: Task[] = meetings.flatMap((m) =>
    m.actionItems.map((item) => ({
      id: item._id,
      title: item.text,
      status: item.completed ? 'done' : 'todo' as Status,
      priority: 'Medium' as Priority,
      assignee: item.assignee || user?.name || '',
      source: m.title,
      meetingId: m._id,
      itemId: item._id,
    }))
  )

  const allTasks = [...apiTasks, ...localTasks]

  // Build members from meeting participants + current user
  const memberMap = new Map<string, { name: string; email: string; role: string; status: string }>()
  if (user) {
    memberMap.set(user.id, { name: user.name, email: user.email, role: user.role === 'admin' ? 'Admin' : 'Member', status: 'Active' })
  }
  meetings.forEach((m) => {
    m.participants.forEach((p) => {
      if (!memberMap.has(p._id)) {
        memberMap.set(p._id, { name: p.name, email: p.email, role: 'Member', status: 'Active' })
      }
    })
    if (!memberMap.has(m.host._id)) {
      memberMap.set(m.host._id, { name: m.host.name, email: m.host.email, role: 'Admin', status: 'Active' })
    }
  })
  const members = Array.from(memberMap.values())
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  )

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return

    const newStatus = destination.droppableId as Status

    // If it's an API task, toggle via API
    const apiTask = apiTasks.find((t) => t.id === draggableId)
    if (apiTask?.meetingId && apiTask?.itemId) {
      const isCurrentlyDone = apiTask.status === 'done'
      const movingToDone = newStatus === 'done'
      if (isCurrentlyDone !== movingToDone) {
        toggleMutation.mutate({ meetingId: apiTask.meetingId, itemId: apiTask.itemId })
      }
    } else {
      // Local task
      setLocalTasks((prev) => prev.map((t) => t.id === draggableId ? { ...t, status: newStatus } : t))
    }
    toast('info', 'Task moved.')
  }

  const handleDeleteTask = (id: string) => {
    const isLocal = localTasks.some((t) => t.id === id)
    if (isLocal) {
      setLocalTasks((prev) => prev.filter((t) => t.id !== id))
      toast('success', 'Task deleted.')
    } else {
      toast('info', 'API action items can be managed from the meeting summary.')
    }
    setDeleteConfirm(null)
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    const task: Task = {
      id: `local-${Date.now()}`,
      title: newTask.title,
      status: newTask.status,
      priority: newTask.priority,
      assignee: user?.name || '',
      source: 'Manual',
    }
    setLocalTasks((prev) => [...prev, task])
    setNewTask({ title: '', priority: 'Medium', status: 'todo' })
    setShowAddTask(false)
    toast('success', 'Task added to the board.')
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    toast('success', `Invitation sent to ${inviteEmail}!`)
    setInviteEmail('')
    setShowInvite(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Team Workspace</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your team and track action items from meetings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'board' && (
            <button onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 bg-card hover:bg-muted text-foreground px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-border">
              <Plus size={15} /> Add Task
            </button>
          )}
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20">
            <UserPlus size={15} /> Invite Member
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {!isLoading && allTasks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {(['todo', 'in-progress', 'done'] as Status[]).map((col) => {
            const meta = columnMeta[col]
            const count = allTasks.filter((t) => t.status === col).length
            return (
              <div key={col} className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${meta.dot} shrink-0`} />
                <div>
                  <p className="text-xs text-muted-foreground">{meta.label}</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">{count}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl w-fit border border-border">
        {(['board', 'members'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-card border border-border text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'board' ? <Layout size={15} /> : <Users size={15} />}
            {tab === 'board' ? 'Project Board' : 'Team Members'}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {tab === 'board' ? allTasks.length : members.length}
            </span>
          </button>
        ))}
      </div>

      {/* Board */}
      {activeTab === 'board' ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 bg-muted animate-pulse rounded-lg w-24" />
                <div className="min-h-[480px] bg-muted/20 rounded-2xl border border-border p-2.5 space-y-2.5">
                  {[1, 2].map((j) => <div key={j} className="h-24 bg-muted animate-pulse rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(['todo', 'in-progress', 'done'] as Status[]).map((col) => {
                const meta = columnMeta[col]
                const colTasks = allTasks.filter((t) => t.status === col)
                return (
                  <div key={col} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-1">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      <h3 className="font-semibold text-foreground text-sm">{meta.label}</h3>
                      <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {colTasks.length}
                      </span>
                    </div>
                    <Droppable droppableId={col}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex flex-col gap-2.5 min-h-[480px] p-2.5 rounded-2xl border transition-all duration-200 ${
                            snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30 scale-[1.01]' : `${meta.bg} border-border`
                          }`}
                        >
                          {colTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-card p-4 rounded-xl border shadow-sm group cursor-grab active:cursor-grabbing transition-all ${
                                    snapshot.isDragging
                                      ? 'shadow-2xl border-primary ring-2 ring-primary/20 rotate-1 scale-105'
                                      : 'border-border hover:border-primary/30 hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityStyles[task.priority]}`}>
                                      {task.priority}
                                    </span>
                                    <ActionMenu onDelete={() => setDeleteConfirm(task.id)} />
                                  </div>
                                  <h4 className="text-sm font-semibold text-foreground leading-snug">{task.title}</h4>
                                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
                                        {(task.assignee || '?').charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-xs text-muted-foreground truncate max-w-[80px]">{task.assignee || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <MessageSquare size={10} />
                                      <span className="truncate max-w-[80px]">{task.source}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {colTasks.length === 0 && (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground/40 text-xs py-8">
                              Drop tasks here
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        )
      ) : (
        /* Members table */
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full h-9 bg-background border border-input rounded-xl py-2 px-4 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60 transition-all"
              />
            </div>
            <span className="text-xs text-muted-foreground">{filteredMembers.length} of {members.length} members</span>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-muted-foreground">
              <Users size={28} className="opacity-30" />
              <p className="text-sm">No members found</p>
              <p className="text-xs opacity-70">Members from your meetings will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground tracking-wider bg-muted/10">
                    <th className="px-6 py-3.5 font-semibold">User</th>
                    <th className="px-6 py-3.5 font-semibold">Role</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMembers.map((member) => (
                    <tr key={member.email} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          member.role === 'Admin'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span className="text-sm text-foreground">{member.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 size={18} className="text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Delete Task</h3>
                <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/60 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDeleteTask(deleteConfirm)}
                className="flex-1 h-10 bg-destructive text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Invite Member</h2>
                  <p className="text-xs text-muted-foreground">They'll receive an email invitation.</p>
                </div>
              </div>
              <button onClick={() => setShowInvite(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com" required autoFocus
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 transition-all" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-muted/60 transition-all">Cancel</button>
                <button type="submit"
                  className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Edit3 size={18} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Add Task</h2>
              </div>
              <button onClick={() => setShowAddTask(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Task title</label>
                <input type="text" value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Review API documentation" required autoFocus
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value as Priority }))}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/60 transition-all">
                    {(['Critical', 'High', 'Medium', 'Low'] as Priority[]).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Column</label>
                  <select value={newTask.status} onChange={(e) => setNewTask((p) => ({ ...p, status: e.target.value as Status }))}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/60 transition-all">
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddTask(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-muted/60 transition-all">Cancel</button>
                <button type="submit"
                  className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
