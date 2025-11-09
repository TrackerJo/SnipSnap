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
}

// Internal Firestore task structure
interface FirestoreTask {
    text: string;
    completed: boolean;
    imageUrl?: string;
    createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
    updatedAt?: Timestamp | ReturnType<typeof serverTimestamp>;
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
    return {
        id,
        text: firestoreTask.text,
        completed: firestoreTask.completed,
        imageUrl: firestoreTask.imageUrl,
        createdAt: firestoreTask.createdAt instanceof Date
            ? firestoreTask.createdAt
            : (firestoreTask.createdAt as Timestamp).toDate(),
        updatedAt: firestoreTask.updatedAt
            ? (firestoreTask.updatedAt instanceof Date
                ? firestoreTask.updatedAt
                : (firestoreTask.updatedAt as Timestamp).toDate())
            : undefined
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

    try {
        await setDoc(taskRef, firestoreTask);
        console.log('✅ Task saved:', task.id);
    } catch (error) {
        console.error('❌ Error saving task:', error);
        throw new Error('Failed to save task');
    }
};/**
 * Load all tasks for the current user
 */
export const loadTasks = async (): Promise<Task[]> => {
    const user = await ensureAuthenticated();
    const tasksCollection = getUserTasksCollection(user.uid);
    const q = query(tasksCollection, orderBy('createdAt', 'desc'));

    try {
        const querySnapshot = await getDocs(q);
        const tasks: Task[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as FirestoreTask;
            tasks.push(convertToTask(doc.id, data));
        });

        console.log('✅ Tasks loaded:', tasks.length);
        return tasks;
    } catch (error) {
        console.error('❌ Error loading tasks:', error);
        throw new Error('Failed to load tasks');
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