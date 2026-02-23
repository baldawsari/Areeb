import React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import useStore from '../lib/store';
import { COLUMNS } from '../lib/agents';

export default function KanbanBoard() {
  const tasks = useStore((s) => s.tasks);
  const filterAgent = useStore((s) => s.filterAgent);
  const filterWorkflow = useStore((s) => s.filterWorkflow);
  const moveTask = useStore((s) => s.moveTask);
  const [activeTask, setActiveTask] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const getColumnTasks = (columnId) => {
    let filtered = tasks.filter((t) => t.status === columnId);
    if (filterAgent) filtered = filtered.filter((t) => t.agent === filterAgent);
    if (filterWorkflow) filtered = filtered.filter((t) => t.workflow === filterWorkflow);
    return filtered;
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    let targetColumn;

    // Check if dropped over a column droppable
    const columnIds = COLUMNS.map((c) => c.id);
    if (columnIds.includes(over.id)) {
      targetColumn = over.id;
    } else {
      // Dropped over a task card - find which column it belongs to
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetColumn = overTask.status;
      }
    }

    if (targetColumn) {
      const currentTask = tasks.find((t) => t.id === taskId);
      if (currentTask && currentTask.status !== targetColumn) {
        moveTask(taskId, targetColumn);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column.id);
          return (
            <Column
              key={column.id}
              column={column}
              tasks={columnTasks}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({ column, tasks }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column flex-shrink-0 w-72 transition-colors duration-200 ${
        isOver ? 'ring-2 ring-blue-500/30 bg-blue-500/5' : ''
      }`}
    >
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-sm font-semibold text-white">{column.title}</h3>
        </div>
        <span className="text-xs font-medium text-surface-400 bg-surface-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-surface-600 text-xs">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
