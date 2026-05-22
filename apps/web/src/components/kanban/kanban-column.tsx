'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { KanbanColumn as KanbanColumnType } from '@/lib/kanban';
import { ConversationCard } from './conversation-card';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onCardClick: (conversationId: string) => void;
}

export function KanbanColumn({ column, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-1 min-w-0 flex flex-col max-h-full">
      {/* Cabeçalho da coluna */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="font-medium text-gray-300 text-sm truncate flex-1">{column.name}</h3>
        <span className="text-xs text-gray-500 bg-white/[0.06] rounded-full px-2 py-0.5 tabular-nums">
          {column.conversations.length}
        </span>
      </div>

      {/* Área droppable */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto rounded-xl p-2 flex flex-col gap-2 min-h-[120px] transition-colors ${
          isOver
            ? 'bg-brand-600/10 ring-1 ring-brand-500/40'
            : 'bg-white/[0.03] border border-white/[0.06]'
        }`}
      >
        <SortableContext
          items={column.conversations.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.conversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              onClick={() => onCardClick(conv.id)}
            />
          ))}
        </SortableContext>

        {column.conversations.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-6">Sem conversas</p>
        )}
      </div>
    </div>
  );
}
