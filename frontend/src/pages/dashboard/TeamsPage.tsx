import { useState } from "react";
import {
  Users,
  Layout,
  Search,
  MoreVertical,
  MessageSquare,
} from "lucide-react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";

const initialTasks = [
  {
    id: 1,
    title: "Draft PR for WebRTC integration",
    status: "todo",
    priority: "High",
    assignee: "Alex J.",
    source: "Tech Sync #12",
  },
  {
    id: 2,
    title: "Design Dashboard Mobile UI",
    status: "in-progress",
    priority: "Medium",
    assignee: "Sophie M.",
    source: "Design Review",
  },
  {
    id: 3,
    title: "Fix JWT Token expiration bug",
    status: "done",
    priority: "Critical",
    assignee: "Alex J.",
    source: "Emergency Fix",
  },
  {
    id: 4,
    title: "Prepare OpenAI prompt optimization",
    status: "todo",
    priority: "Low",
    assignee: "Maria K.",
    source: "AI Strategy",
  },
];

const members = [
  {
    name: "Sophie M.",
    email: "sophie@intellmeet.com",
    role: "Admin",
    status: "Active",
  },
  {
    name: "Alex J.",
    email: "alex@intellmeet.com",
    role: "Member",
    status: "Active",
  },
  {
    name: "Maria K.",
    email: "maria@intellmeet.com",
    role: "Member",
    status: "Away",
  },
];

function ActionMenu({ onEdit, onDelete }: { onEdit?: () => void, onDelete?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation(); 
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
      >
        <MoreVertical size={14} />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu en cliquant ailleurs */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in duration-150">
            <button 
              onClick={() => { onEdit?.(); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Edit Task
            </button>
            <button 
              onClick={() => { onDelete?.(); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              Delete Task
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState<"board" | "members">("board");

  const [tasks, setTasks] = useState(initialTasks);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const newTasks = Array.from(tasks);
    const draggedTask = newTasks.find((t) => t.id.toString() === draggableId);

    if (draggedTask) {
      draggedTask.status = destination.droppableId;
      setTasks([...newTasks]);

      console.log(`Task ${draggableId} moved to ${destination.droppableId}`);
    }
  };
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header /}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Team Workspace
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your team members and track AI-generated action items.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-muted hover:bg-accent text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border">
            <ExternalLink size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-primary/20">
            <UserPlus size={16} />
            Invite Member
          </button>
        </div>
      </div>

      {/* Navigation (Tabs) */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab("board")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "board" ? "bg-card border border-border text-card-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Layout size={16} />
          Project Board
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "members" ? "bg-card border border-border text-card-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Users size={16} />
          Team Members
        </button>
      </div>

      {activeTab === "board" ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["todo", "in-progress", "done"].map((columnId) => (
              <div key={columnId} className="flex flex-col gap-4">
                <h3 className="font-bold text-foreground uppercase text-xs tracking-widest px-2">
                  {columnId.replace("-", " ")}
                </h3>

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col gap-3 min-h-[500px] p-2 rounded-xl border border-border transition-colors ${
                        snapshot.isDraggingOver
                          ? "bg-primary/5 border-primary/40"
                          : "bg-muted/20 border-border"
                      }`}
                    >
                      {tasks
                        .filter((t) => t.status === columnId)
                        .map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-card p-4 rounded-xl border border-border shadow-sm group ${
                                  snapshot.isDragging
                                    ? "shadow-2xl border-primary ring-2 ring-primary/20 rotate-2"
                                    : ""
                                }`}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-primary/10 text-primary">
                                    {task.priority}
                                  </span>
                                  <ActionMenu 
                                        onEdit={() => console.log("Editing", task.id)} 
                                        onDelete={() => console.log("Deleting", task.id)} 
                                    />
                                </div>
                                <h4 className="text-sm font-semibold text-foreground">
                                  {task.title}
                                </h4>
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                    {task.assignee.charAt(0)}
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <MessageSquare size={10} />
                                    {task.source}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search members..."
                className="w-full bg-background border border-input rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Search
                className="absolute left-3 top-2.5 text-muted-foreground"
                size={16}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground tracking-wider">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => (
                  <tr
                    key={member.email}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${member.role === "Admin" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border"}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${member.status === "Active" ? "bg-green-500" : "bg-amber-500"}`}
                        />
                        <span className="text-sm text-foreground">
                          {member.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
