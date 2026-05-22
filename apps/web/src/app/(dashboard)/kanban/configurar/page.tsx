'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  fetchColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
  type KanbanColumnConfig,
} from '@/lib/kanban';

// ── Color palette ─────────────────────────────────────────────────────────────

const COLORS = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#14B8A6', '#3B82F6', '#8B5CF6',
  '#EC4899', '#F43F5E', '#06B6D4', '#84CC16',
];

// ── Sortable row ──────────────────────────────────────────────────────────────

function SortableRow({
  col,
  onEdit,
  onDelete,
  isDeleting,
}: {
  col: KanbanColumnConfig;
  onEdit: (col: KanbanColumnConfig) => void;
  onDelete: (col: KanbanColumnConfig) => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: col.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 group"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors touch-none"
      >
        ⠿
      </button>

      {/* Color dot */}
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: col.color }} />

      {/* Name */}
      <span className="flex-1 text-sm text-white/80 font-medium">{col.name}</span>

      {/* Count */}
      <span className="text-xs text-white/30 tabular-nums">
        {col._count.conversations} conversa{col._count.conversations !== 1 ? 's' : ''}
      </span>

      {/* Default badge */}
      {col.isDefault && (
        <span className="text-[10px] text-brand-400 bg-brand-400/10 border border-brand-400/20 px-2 py-0.5 rounded-full">
          padrão
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(col)}
          className="px-2.5 py-1 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-colors"
        >
          Editar
        </button>
        {!col.isDefault && (
          <button
            onClick={() => onDelete(col)}
            disabled={isDeleting}
            className="px-2.5 py-1 text-xs text-red-400/60 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 rounded-lg transition-colors disabled:opacity-40"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

// ── Color Picker ──────────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${value === c ? 'ring-2 ring-offset-2 ring-offset-[#13131f] ring-white/60 scale-110' : ''}`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({
  col,
  onSave,
  onClose,
  isPending,
}: {
  col: KanbanColumnConfig;
  onSave: (data: { name: string; color: string }) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(col.name);
  const [color, setColor] = useState(col.color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Editar coluna</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
              maxLength={32}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Cor</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-white/40 hover:text-white/70 border border-white/10 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave({ name: name.trim(), color })}
            disabled={!name.trim() || isPending}
            className="flex-1 py-2.5 text-sm bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-medium rounded-xl transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function KanbanConfigPage() {
  const qc = useQueryClient();
  const [editingCol, setEditingCol] = useState<KanbanColumnConfig | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]!);
  const [showNewForm, setShowNewForm] = useState(false);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);

  const { data: columns = [], isLoading } = useQuery({
    queryKey: ['kanban-columns'],
    queryFn: fetchColumns,
    select: (cols) => {
      if (localOrder) {
        return [...cols].sort((a, b) => localOrder.indexOf(a.id) - localOrder.indexOf(b.id));
      }
      return cols;
    },
  });

  const createMut = useMutation({
    mutationFn: (d: { name: string; color: string }) => createColumn(d),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kanban-columns'] });
      void qc.invalidateQueries({ queryKey: ['kanban-board'] });
      setNewName('');
      setNewColor(COLORS[0]!);
      setShowNewForm(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; color: string } }) =>
      updateColumn(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kanban-columns'] });
      void qc.invalidateQueries({ queryKey: ['kanban-board'] });
      setEditingCol(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteColumn(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kanban-columns'] });
      void qc.invalidateQueries({ queryKey: ['kanban-board'] });
    },
  });

  const reorderMut = useMutation({
    mutationFn: (ids: string[]) => reorderColumns(ids),
    onSuccess: () => {
      setLocalOrder(null);
      void qc.invalidateQueries({ queryKey: ['kanban-columns'] });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = columns.map((c) => c.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    const reordered = arrayMove(ids, oldIdx, newIdx);
    setLocalOrder(reordered);
    reorderMut.mutate(reordered);
  }

  function handleDeleteConfirm(col: KanbanColumnConfig) {
    if (col._count.conversations > 0) {
      alert(`Esta coluna tem ${col._count.conversations} conversa(s). Move-as para outra coluna antes de eliminar.`);
      return;
    }
    if (confirm(`Eliminar a coluna "${col.name}"?`)) {
      deleteMut.mutate(col.id);
    }
  }

  return (
    <>
      {editingCol && (
        <EditModal
          col={editingCol}
          onSave={(d) => updateMut.mutate({ id: editingCol.id, data: d })}
          onClose={() => setEditingCol(null)}
          isPending={updateMut.isPending}
        />
      )}

      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Colunas do Kanban</h1>
            <p className="text-sm text-white/40 mt-1">Cria, edita e reordena as colunas do teu pipeline.</p>
          </div>
          <Link href="/kanban" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Voltar ao Kanban
          </Link>
        </div>

        {/* Column list */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {columns.map((col) => (
                  <SortableRow
                    key={col.id}
                    col={col}
                    onEdit={setEditingCol}
                    onDelete={handleDeleteConfirm}
                    isDeleting={deleteMut.isPending}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Add column */}
        {showNewForm ? (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-medium text-white/70">Nova coluna</h3>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Nome</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Em negociação"
                maxLength={32}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-2">Cor</label>
              <ColorPicker value={newColor} onChange={setNewColor} />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowNewForm(false); setNewName(''); }}
                className="flex-1 py-2.5 text-sm text-white/40 hover:text-white/70 border border-white/10 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => createMut.mutate({ name: newName.trim(), color: newColor })}
                disabled={!newName.trim() || createMut.isPending}
                className="flex-1 py-2.5 text-sm bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-medium rounded-xl transition-colors"
              >
                {createMut.isPending ? 'A criar...' : 'Criar coluna'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full py-3 border border-dashed border-white/15 hover:border-brand-500/40 text-white/30 hover:text-brand-400 text-sm rounded-xl transition-colors"
          >
            + Nova coluna
          </button>
        )}

        <p className="text-xs text-white/20 text-center">
          Arrasta as linhas para reordenar · A coluna padrão não pode ser eliminada
        </p>
      </div>
    </>
  );
}
