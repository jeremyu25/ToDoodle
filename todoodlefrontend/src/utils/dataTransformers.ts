import type { Note, Task, Folder, Status } from '../types/types';

// Convert backend Note to frontend Task
export const noteToTask = (note: Note, folders: Folder[]): Task => {
  const folder = folders.find(f => f.id === note.folder_id);
  
  // Map backend status values to frontend Status type
  let status: Status = 'NOT_STARTED';
  if (note.status === 'completed') {
    status = 'COMPLETED';
  } else if (note.status === 'in_progress') {
    status = 'IN_PROGRESS';
  } else if (note.status === 'not_started') {
    status = 'NOT_STARTED';
  }

  return {
    id: note.id,
    title: note.title || 'Untitled Note',
    description: note.content,
    status,
    folderId: note.folder_id,
    folder,
    createdAt: new Date(note.created_at),
  };
};

// Convert frontend Task to backend Note
export const taskToNote = (task: Task, userId: string): Omit<Note, 'id' | 'created_at' | 'updated_at'> => {
  // Map frontend Status to backend status values
  let status = 'not_started';
  if (task.status === 'COMPLETED') {
    status = 'completed';
  } else if (task.status === 'IN_PROGRESS') {
    status = 'in_progress';
  }

  return {
    user_id: userId,
    folder_id: task.folderId,
    title: task.title,
    content: task.description,
    status: status as 'not_started' | 'in_progress' | 'completed',
  };
};

// Add default colors to folders if they don't have them
export const addDefaultColors = (folders: Folder[]): Folder[] => {
  const defaultColors = ['#A8BBA0', '#C2B6A6', '#e2b64f', '#D98A7B', '#9B59B6', '#3498DB', '#E74C3C', '#F39C12'];
  
  return folders.map((folder, index) => ({
    ...folder,
    color: folder.color || defaultColors[index % defaultColors.length],
    description: folder.description || `${folder.name} folder`,
  }));
};
