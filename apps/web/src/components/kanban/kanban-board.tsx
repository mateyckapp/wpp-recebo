'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBoard, moveConversation, type KanbanConversation } from '@/lib/kanban';
import { KanbanColumn } from './kanban-column';
import { ConversationCard } from './conversation-card';

interface KanbanBoardProps {
  onConversationSelect: (id: string) => void;
}

export function KanbanBoard({ onConversationSelect }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<KanbanConversation | null>(null);

  const { data: columns = [], isLoading, error } = useQuery({
    queryKey: ['kanban-board'],
    queryFn: fetchBoard,
    refetchInterval: 3_000,
  });

  const moveMutation = useMutation({
    mutationFn: ({ conversationId, columnId }: { conversationId: string; columnId: string }) =>
      moveConversation(conversationId, columnId),
    onMutate: async ({ conversationId, columnId }) => {
      await queryClient.cancelQueries({ queryKey: ['kanban-board'] });
      const prev = queryClient.getQueryData(['kanban-board']);

      queryClient.setQueryData(['kanban-board'], (old: typeof columns) => {
        let movedConv: KanbanConversation | undefined;
        const updated = old.map((col) => {
          const filtered = col.conversations.filter((c) => {
            if (c.id === conversationId) { movedConv = c; return false; }
            return true;
          });
          return { ...col, conversations: filtered };
        });
        return updated.map((col) =>
          col.id === columnId && movedConv
            ? { ...col, conversations: [movedConv, ...col.conversations] }
            : col,
        );
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['kanban-board'], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['kanban-board'] }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const conv = columns
        .flatMap((c) => c.conversations)
        .find((c) => c.id === event.active.id);
      setActiveConversation(conv ?? null);
    },
    [columns],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveConversation(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const targetColumnId =
        columns.find((col) =>
          col.id === over.id || col.conversations.some((c) => c.id === over.id),
        )?.id;

      if (!targetColumnId) return;

      const currentColumnId = columns.find((col) =>
        col.conversations.some((c) => c.id === active.id),
      )?.id;

      if (currentColumnId !== targetColumnId) {
        moveMutation.mutate({ conversationId: String(active.id), columnId: targetColumnId });
      }
    },
    [columns, moveMutation],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">A carregar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-sm">Erro ao carregar o quadro</div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 h-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onCardClick={onConversationSelect}
          />
        ))}
      </div>

      <DragOverlay>
        {activeConversation && (
          <ConversationCard conversation={activeConversation} onClick={() => undefined} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
