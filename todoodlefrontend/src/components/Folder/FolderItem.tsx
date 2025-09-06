import './FolderItem.css';

import type { Folder } from "../../types/types";
import React from "react";

type FolderItemProps = {
    folder: Folder;
    editingFolder: Folder | null;
    editFolderName: string;
    setEditFolderName: React.Dispatch<React.SetStateAction<string>>;
    handleUpdateFolder: () => void;
    handleCancelEdit: () => void;
    handleEditFolder: (folder: Folder) => void;
    handleDeleteFolder: (folder: Folder) => void;
    getFolderCount: (folderId: string) => number;
    filterFolder: string | "ALL";
    setFilterFolder: React.Dispatch<React.SetStateAction<string | "ALL">>;
};

const FolderItem: React.FC<FolderItemProps> = ({
    folder,
    editingFolder,
    editFolderName,
    setEditFolderName,
    handleUpdateFolder,
    handleCancelEdit,
    handleEditFolder,
    handleDeleteFolder,
    getFolderCount,
    filterFolder,
    setFilterFolder
}) => {
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
                            onChange={(e) => setEditFolderName(e.target.value)}
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
                                    handleEditFolder(folder);
                                }}
                                className="folder-edit-btn"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(folder);
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