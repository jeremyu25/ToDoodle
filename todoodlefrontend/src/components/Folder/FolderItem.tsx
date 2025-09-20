import './FolderItem.css';
import type { Folder } from "../../types/types";
import React from "react";
import { useTodoStore } from "../../stores/toDoStore";
import { useUIStore } from "../../stores/uiStore";
import { useFiltersStore } from "../../stores/filtersStore";

type FolderItemProps = {
    folder: Folder;
};

const FolderItem: React.FC<FolderItemProps> = ({ folder }) => {
    // Get what we need from stores
    const { updateFolder, deleteFolder, getFolderCount } = useTodoStore();
    const { 
        editingFolder, 
        editFolderName, 
        startEditingFolder, 
        updateEditFolderName, 
        cancelEditingFolder 
    } = useUIStore();
    const { filterFolder, setFilterFolder } = useFiltersStore();

    const handleUpdateFolder = async () => {
        if (!editingFolder || !editFolderName.trim()) return;
        await updateFolder(editingFolder.id, editFolderName.trim());
        cancelEditingFolder();
    };

    const handleDeleteFolder = async () => {
        await deleteFolder(folder.id);
    };

    const handleEditFolder = () => {
        startEditingFolder(folder);
    };

    const handleCancelEdit = () => {
        cancelEditingFolder();
    };
    return (
        <div
            key={folder.id}
            className={`folder-card ${filterFolder === folder.id ? 'selected' : ''}`}
        >
            <div
                className="folder-color"
                style={{ backgroundColor: folder.color || '#A8BBA0' }}
                onClick={() => setFilterFolder(folder.id)}
            ></div>
            <div className="folder-info" onClick={() => setFilterFolder(folder.id)}>
                {editingFolder?.id === folder.id ? (
                    <div className="folder-edit-form">
                        <input
                            type="text"
                            value={editFolderName}
                            onChange={(e) => updateEditFolderName(e.target.value)}
                            className="folder-edit-input"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="folder-edit-buttons">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateFolder();
                                }}
                                className="folder-save-btn"
                                disabled={!editFolderName.trim()}
                            >
                                Save
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                }}
                                className="folder-cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="folder-details">
                            <span className="folder-name">{folder.name}</span>
                            <span className="folder-count">{getFolderCount(folder.id)} tasks</span>
                        </div>
                        <div className="folder-actions">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFolder();
                                }}
                                className="folder-edit-btn"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder();
                                }}
                                className="folder-delete-btn"
                            >
                                🗑️
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default FolderItem