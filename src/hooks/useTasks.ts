/**
 * Custom React Hook for Firebase Task Management
 * Provides a clean interface for managing tasks with automatic Firebase sync
 */

import { useState, useEffect } from 'react';
import {
    loadTasks,
    saveTask,
    updateTask,
    deleteTask,
    onAuthChange
} from '../utils/firebase';

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    imageUrl?: string;
}

export const useTasks = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load tasks when user authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                setIsAuthenticated(true);
                try {
                    const tasks = await loadTasks();
                    // Load all tasks including completed ones
                    setTodos(tasks.map(task => ({
                        id: task.id,
                        text: task.text,
                        completed: task.completed,
                        imageUrl: task.imageUrl
                    })));
                    setError(null);
                } catch (err) {
                    console.error('Error loading tasks:', err);
                    setError('Failed to load tasks');
                } finally {
                    setLoading(false);
                }
            } else {
                setIsAuthenticated(false);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    /**
     * Add a new task
     */
    const addTodo = async (text: string): Promise<void> => {
        const newTodo: Todo = {
            id: Date.now().toString(),
            text,
            completed: false,
        };

        try {
            // Optimistic update
            setTodos(prev => [newTodo, ...prev]);

            // Save to Firebase
            await saveTask(newTodo);
            setError(null);
        } catch (err) {
            console.error('Error adding task:', err);
            // Revert optimistic update on error
            setTodos(prev => prev.filter(t => t.id !== newTodo.id));
            setError('Failed to add task');
            throw err;
        }
    };

    /**
     * Complete a task with an image
     */
    const completeTodo = async (id: string, imageUrl: string): Promise<void> => {
        console.log('🔵 completeTodo called with:', { id, completed: true });
        try {
            // Optimistic update - keep imageUrl in local state for UI display
            setTodos(prev => prev.map(todo =>
                todo.id === id ? { ...todo, completed: true, imageUrl } : todo
            ));

            // Update in Firebase - only save completed status, not the image
            console.log('🔵 Calling updateTask with completed: true (no imageUrl)');
            await updateTask(id, { completed: true });
            console.log('✅ Task completed successfully in Firebase');
            setError(null);
        } catch (err) {
            console.error('❌ Error completing task:', err);
            // Revert optimistic update on error
            setTodos(prev => prev.map(todo =>
                todo.id === id ? { ...todo, completed: false, imageUrl: undefined } : todo
            ));
            setError('Failed to complete task');
            throw err;
        }
    };

    /**
     * Update task text
     */
    const updateTodoText = async (id: string, text: string): Promise<void> => {
        try {
            // Optimistic update
            setTodos(prev => prev.map(todo =>
                todo.id === id ? { ...todo, text } : todo
            ));

            // Update in Firebase
            await updateTask(id, { text });
            setError(null);
        } catch (err) {
            console.error('Error updating task:', err);
            // Revert optimistic update on error
            const originalTodo = todos.find(t => t.id === id);
            if (originalTodo) {
                setTodos(prev => prev.map(todo =>
                    todo.id === id ? originalTodo : todo
                ));
            }
            setError('Failed to update task');
            throw err;
        }
    };

    /**
     * Delete a task
     */
    const deleteTodo = async (id: string): Promise<void> => {
        const deletedTodo = todos.find(t => t.id === id);

        try {
            // Optimistic update
            setTodos(prev => prev.filter(todo => todo.id !== id));

            // Delete from Firebase
            await deleteTask(id);
            setError(null);
        } catch (err) {
            console.error('Error deleting task:', err);
            // Revert optimistic update on error
            if (deletedTodo) {
                setTodos(prev => [...prev, deletedTodo]);
            }
            setError('Failed to delete task');
            throw err;
        }
    };

    return {
        todos,
        loading,
        error,
        isAuthenticated,
        addTodo,
        completeTodo,
        updateTodoText,
        deleteTodo,
    };
};
