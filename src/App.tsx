import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Scissors, Sparkles, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { TodoItem } from "./components/TodoItem";
import { AddTodoDialog } from "./components/AddTodoDialog";
import { CameraDialog } from "./components/CameraDialog";
import { SettingsDialog } from "./components/SettingsDialog";
import { useTasks } from "./hooks/useTasks";

export default function App() {
  const {
    todos,
    loading,
    error,
    addTodo,
    completeTodo,
    updateTodoText,
    deleteTodo
  } = useTasks();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  const handleAddTodo = async (text: string) => {
    try {
      await addTodo(text);
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleCompleteTodo = (id: string) => {
    setSelectedTodoId(id);
    setCameraDialogOpen(true);
  };

  const handleCameraCapture = async (imageUrl: string) => {
    console.log('🔵 handleCameraCapture called with:', { selectedTodoId, imageUrlLength: imageUrl?.length });
    if (selectedTodoId) {
      try {
        console.log('🔵 Calling completeTodo...');
        await completeTodo(selectedTodoId, imageUrl);
        console.log('✅ completeTodo finished successfully');
        setSelectedTodoId(null);
      } catch (error) {
        console.error('❌ Failed to complete todo:', error);
      }
    } else {
      console.warn('⚠️ No selectedTodoId found!');
    }
  };

  const handleUpdateTask = async (newTaskText: string) => {
    if (selectedTodoId) {
      try {
        await updateTodoText(selectedTodoId, newTaskText);
        setSelectedTodoId(null);
      } catch (error) {
        console.error('Failed to update todo:', error);
      }
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const selectedTodo = todos.find(t => t.id === selectedTodoId);
  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);
  const completedCount = completedTodos.length;
  const activeCount = activeTodos.length;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Scissors className="h-12 w-12 mx-auto mb-4" style={{ color: '#A7C7E7', animation: 'scissors-cut 0.6s ease-in-out infinite' }} />
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="mb-4 text-red-500">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload App</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Decorative background pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 rotate-45">
          <Scissors className="h-20 w-20" style={{ color: '#A7C7E7' }} />
        </div>
        <div className="absolute bottom-20 right-20 -rotate-12">
          <Scissors className="h-24 w-24" style={{ color: '#FFE484' }} />
        </div>
        <div className="absolute top-1/2 left-1/4 rotate-90">
          <Scissors className="h-16 w-16" style={{ color: '#B8D4F1' }} />
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Scissors className="h-12 w-12" style={{ color: '#A7C7E7' }} />
            </motion.div>
            <h1 style={{ color: '#1F2937', fontSize: '3.75rem', fontWeight: 'bold', lineHeight: '1' }}>
              SnipSnap
            </h1>
          </div>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            The AI todo list that keeps you accountable! Create tasks, snap photos to prove completion, and watch them get snipped away! ✂️📸
          </p>

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="px-4 py-2 bg-white rounded-full border-2" style={{ borderColor: '#A7C7E7', boxShadow: '0 1px 2px 0 rgba(31, 41, 55, 0.10)' }}>
              <span className="text-sm text-muted-foreground">Active Tasks: </span>
              <span style={{ color: '#7FB2E5' }}>{activeCount}</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-full border-2 border-green-200" style={{ boxShadow: '0 1px 2px 0 rgba(31, 41, 55, 0.10)' }}>
              <span className="text-sm text-muted-foreground">Completed: </span>
              <span className="text-green-600">{completedCount}</span>
            </div>
          </div>
        </motion.div>

        {/* Add Task Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6"
        >
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="lg"
            className="w-full transition-all"
            style={{
              backgroundColor: '#A7C7E7',
              color: '#1F2937',
              boxShadow: '0 10px 15px -3px rgba(31, 41, 55, 0.10), 0 4px 6px -2px rgba(31, 41, 55, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7FB2E5';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(31, 41, 55, 0.10), 0 10px 10px -5px rgba(31, 41, 55, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#A7C7E7';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(31, 41, 55, 0.10), 0 4px 6px -2px rgba(31, 41, 55, 0.05)';
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Task
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>

        {/* Todo List - Only show active tasks */}
        <div className="space-y-4">
          {activeTodos.length === 0 && completedTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Scissors className="h-16 w-16 mx-auto mb-4" style={{ color: '#B8D4F1' }} />
              <h3 className="text-muted-foreground mb-2">No tasks yet!</h3>
              <p className="text-sm text-muted-foreground">
                Create your first task and start snipping away! ✂️
              </p>
            </motion.div>
          ) : activeTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Scissors className="h-16 w-16 mx-auto mb-4" style={{ color: '#86EFAC' }} />
              <h3 className="text-muted-foreground mb-2">All tasks completed! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                You've completed {completedCount} task{completedCount !== 1 ? 's' : ''}. Keep it up!
              </p>
            </motion.div>
          ) : (
            activeTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onComplete={handleCompleteTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-block px-6 py-3 bg-white rounded-full border-2 border-dashed" style={{ borderColor: '#A7C7E7', boxShadow: '0 1px 2px 0 rgba(31, 41, 55, 0.10)' }}>
            <p className="text-sm text-muted-foreground">
              Powered by AI • Snap, Prove, Complete ✨
            </p>
          </div>
        </motion.div>
      </div>

      {/* Dialogs */}
      <AddTodoDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddTodo}
      />

      <CameraDialog
        open={cameraDialogOpen}
        onOpenChange={setCameraDialogOpen}
        onCapture={handleCameraCapture}
        onUpdateTask={handleUpdateTask}
        taskText={selectedTodo?.text || ""}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  );
}
