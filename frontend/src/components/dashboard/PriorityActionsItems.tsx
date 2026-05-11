import React, { useState } from "react";

interface ActionItem {
  id: number;
  title: string;
  source: string;
  completed?: boolean;
}

interface PriorityActionItemsProps {
  items?: ActionItem[];
}

const defaultItems: ActionItem[] = [
  { id: 1, title: "Review technical specifications with the team", source: "Project Kickoff", completed: false },
  { id: 2, title: "Review marketing assets with the team", source: "Project Kickoff", completed: false },
  { id: 3, title: "Review design assets with the team", source: "Project Kickoff", completed: false },
];

export function PriorityActionItems({ items = defaultItems }: PriorityActionItemsProps) {
  const [actionItems, setActionItems] = useState(items);

  const toggleItem = (id: number) => {
    setActionItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border bg-muted/30">
        <h2 className="font-bold text-foreground">Priority Action Items</h2>
      </div>
      <div className="p-5 space-y-4">
        {actionItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-start gap-4 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors group"
          >
            <div className="mt-1">
              <input 
                type="checkbox" 
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary focus:ring-offset-background" 
              />
            </div>
            <div className="flex-1">
              <p className={`text-sm text-foreground font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-muted-foreground">From:</span>
                <span className="text-[11px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded">
                  {item.source}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}