/**
 * Firebase Configuration and Initialization
 * Handles Firebase setup, authentication, and Firestore database access
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    serverTimestamp,
    type Firestore,
    type Timestamp
} from 'firebase/firestore';

// Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKcx38PtRw4yIsTimyol9wgbYQhpmht1Q",
    authDomain: "snipsnap-claude.firebaseapp.com",
    projectId: "snipsnap-claude",
    storageBucket: "snipsnap-claude.firebasestorage.app",
    messagingSenderId: "523136317065",
    appId: "1:523136317065:web:723c7b8a16f9084e83f858"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Task interface matching the app's Todo structure
export interface Task {
    id: string;
    text: string;
    completed: boolean;
    imageUrl?: string;
    createdAt: Date | Timestamp;
    updatedAt?: Date | Timestamp;
    completedAt?: Date | Timestamp;
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedMinutes?: number;
    urgency?: number;
    importance?: number;
}

// Internal Firestore task structure
interface FirestoreTask {
    text: string;
    completed: boolean;
    imageUrl?: string;
    createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
    updatedAt?: Timestamp | ReturnType<typeof serverTimestamp>;
    completedAt?: Timestamp | ReturnType<typeof serverTimestamp>;
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedMinutes?: number;
    urgency?: number;
    importance?: number;
}

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

/**
 * Sign in anonymously and return the user
 */
export const signInAnonymouslyUser = async (): Promise<User> => {
    try {
        const result = await signInAnonymously(auth);
        console.log('✅ User signed in anonymously:', result.user.uid);
        return result.user;
    } catch (error) {
        console.error('❌ Error signing in anonymously:', error);
        throw new Error('Failed to authenticate user');
    }
};

/**
 * Ensure user is authenticated, sign in if not
 */
export const ensureAuthenticated = async (): Promise<User> => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        return currentUser;
    }
    return await signInAnonymouslyUser();
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get the user-specific tasks collection path
 */
const getUserTasksCollection = (uid: string) => {
    return collection(db, 'users', uid, 'tasks');
};

/**
 * Convert Firestore task to app Task format
 */
const convertToTask = (id: string, firestoreTask: FirestoreTask): Task => {
    // Helper to safely convert Firestore timestamp to Date
    const toDate = (timestamp: Timestamp | ReturnType<typeof serverTimestamp> | undefined | null): Date | undefined => {
        if (!timestamp) return undefined;
        if (timestamp instanceof Date) return timestamp;
        // Check if it's a Firestore Timestamp with toDate method
        if (typeof (timestamp as Timestamp).toDate === 'function') {
            return (timestamp as Timestamp).toDate();
        }
        // Fallback for server timestamp sentinel or other cases
        return undefined;
    };

    return {
        id,
        text: firestoreTask.text,
        completed: firestoreTask.completed,
        imageUrl: firestoreTask.imageUrl,
        createdAt: toDate(firestoreTask.createdAt) || new Date(),
        updatedAt: toDate(firestoreTask.updatedAt),
        completedAt: toDate(firestoreTask.completedAt),
        difficulty: firestoreTask.difficulty,
        estimatedMinutes: firestoreTask.estimatedMinutes,
        urgency: firestoreTask.urgency,
        importance: firestoreTask.importance,
    };
};

/**
 * Save a task to Firestore for the current user
 */
export const saveTask = async (task: Omit<Task, 'createdAt' | 'updatedAt'>): Promise<void> => {
    const user = await ensureAuthenticated();
    const tasksCollection = getUserTasksCollection(user.uid);
    const taskRef = doc(tasksCollection, task.id);

    const firestoreTask: FirestoreTask = {
        text: task.text,
        completed: task.completed,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    // Only add optional fields if they exist (Firestore doesn't support undefined)
    if (task.imageUrl) {
        firestoreTask.imageUrl = task.imageUrl;
    }
    if (task.difficulty) {
        firestoreTask.difficulty = task.difficulty;
    }
    if (task.estimatedMinutes !== undefined) {
        firestoreTask.estimatedMinutes = task.estimatedMinutes;
    }
    if (task.urgency !== undefined) {
        firestoreTask.urgency = task.urgency;
    }
    if (task.importance !== undefined) {
        firestoreTask.importance = task.importance;
    }

    try {
        await setDoc(taskRef, firestoreTask);
        console.log('✅ Task saved:', task.id);
    } catch (error) {
        console.error('❌ Error saving task:', error);
        // Rethrow with actual error details
        throw error;
    }
};

/**
 * Load all tasks for the current user
 */
export const loadTasks = async (): Promise<Task[]> => {
    const user = await ensureAuthenticated();
    const tasksCollection = getUserTasksCollection(user.uid);

    try {
        // Try with orderBy first, fall back to simple query if index doesn't exist
        let querySnapshot;
        try {
            const q = query(tasksCollection, orderBy('createdAt', 'desc'));
            querySnapshot = await getDocs(q);
        } catch (indexError) {
            console.warn('⚠️ orderBy query failed (index may not exist), using simple query:', indexError);
            // Fall back to simple query without ordering
            querySnapshot = await getDocs(tasksCollection);
        }

        const tasks: Task[] = [];

        querySnapshot.forEach((docSnapshot) => {
            try {
                const data = docSnapshot.data() as FirestoreTask;
                tasks.push(convertToTask(docSnapshot.id, data));
            } catch (conversionError) {
                console.warn('⚠️ Skipping task with conversion error:', docSnapshot.id, conversionError);
            }
        });

        // Sort by createdAt client-side if we couldn't use orderBy
        tasks.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
            return dateB - dateA;
        });

        console.log('✅ Tasks loaded:', tasks.length);
        return tasks;
    } catch (error) {
        console.error('❌ Error loading tasks:', error);
        throw error;
    }
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> => {
    console.log('🔵 updateTask called with:', { taskId, updates });
    const user = await ensureAuthenticated();
    const tasksCollection = getUserTasksCollection(user.uid);
    const taskRef = doc(tasksCollection, taskId);

    // Remove undefined values (Firestore doesn't support them)
    const firestoreUpdates: Record<string, string | boolean | ReturnType<typeof serverTimestamp>> = {
        updatedAt: serverTimestamp()
    };

    if (updates.text !== undefined) {
        firestoreUpdates.text = updates.text;
    }
    if (updates.completed !== undefined) {
        firestoreUpdates.completed = updates.completed;
    }
    if (updates.imageUrl !== undefined) {
        firestoreUpdates.imageUrl = updates.imageUrl;
    }

    console.log('🔵 Firestore updates to apply:', firestoreUpdates);

    try {
        await updateDoc(taskRef, firestoreUpdates);
        console.log('✅ Task updated in Firestore:', taskId);
    } catch (error) {
        console.error('❌ Error updating task:', error);
        throw new Error('Failed to update task');
    }
};/**
 * Delete a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
    const user = await ensureAuthenticated();
    const tasksCollection = getUserTasksCollection(user.uid);
    const taskRef = doc(tasksCollection, taskId);

    try {
        await deleteDoc(taskRef);
        console.log('✅ Task deleted:', taskId);
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        throw new Error('Failed to delete task');
    }
};

/**
 * Get a single task by ID
 */
export const getTask = async (taskId: string): Promise<Task | null> => {
    const user = await ensureAuthenticated();
    const tasksCollection = getUserTasksCollection(user.uid);
    const taskRef = doc(tasksCollection, taskId);

    try {
        const docSnap = await getDoc(taskRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as FirestoreTask;
            return convertToTask(docSnap.id, data);
        }
        return null;
    } catch (error) {
        console.error('❌ Error getting task:', error);
        throw new Error('Failed to get task');
    }
};

// Export auth and db instances for advanced usage if needed
export { auth, db };