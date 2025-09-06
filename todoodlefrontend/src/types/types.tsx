export const Statuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const
export type Status = typeof Statuses[number]
export const StatusLabels: Record<Status, string> = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
}

export type Folder = {
    id: string;
    name: string;
    color?: string;
    description?: string;
    created_at?: string;
};

export type Note = {
    id: string;
    user_id: string;
    folder_id?: string;
    title?: string;
    content: string;
    status: 'not_started' | 'in_progress' | 'completed';
    created_at: string;
    updated_at: string;
};

export type Task = {
    id: string;
    title: string;
    description: string;
    status: Status;
    folderId?: string;
    folder?: Folder;
    createdAt: Date;
};