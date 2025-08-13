export type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type Folder = {
    id: number;
    name: string;
    color?: string;
    description?: string;
}

export type Task = {
    id: number;
    title: string;
    description: string;
    status: Status;
    folderId?: number;
    folder?: Folder;
    createdAt: Date;
}