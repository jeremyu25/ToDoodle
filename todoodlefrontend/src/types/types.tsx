export const StatusLabels = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
} as const

export const Statuses = Object.keys(StatusLabels) as Array<keyof typeof StatusLabels>
export type Status = keyof typeof StatusLabels

export type Folder = {
    id: string;
    name: string;
    color?: string;
    description?: string;
    created_at?: string;
    is_default: boolean;
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

export type PendingEmailChange = {
    id?: string;
    user_id?: string;
    old_email?: string;
    new_email: string;
    verification_expires: string;
    created_at?: string;
};