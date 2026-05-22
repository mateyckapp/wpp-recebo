'use client';

import { useState } from 'react';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { ConversationPanel } from '@/components/kanban/conversation-panel';

export default function KanbanPage(): React.ReactElement {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="flex h-full gap-4 overflow-hidden">
      {/* Quadro Kanban */}
      <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${selectedConversationId ? 'hidden md:block' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-100">Kanban</h1>
        </div>
        <div className="h-[calc(100%-2.5rem)] overflow-hidden">
          <KanbanBoard onConversationSelect={setSelectedConversationId} />
        </div>
      </div>

      {/* Painel de conversa (slide-in lateral) */}
      {selectedConversationId && (
        <div className="w-full md:w-96 flex-shrink-0 border-l border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <ConversationPanel
            conversationId={selectedConversationId}
            onClose={() => setSelectedConversationId(null)}
          />
        </div>
      )}
    </div>
  );
}
