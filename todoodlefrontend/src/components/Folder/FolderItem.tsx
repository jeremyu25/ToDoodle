import './FolderItem.css';
import type { Folder } from "../../types/types";
import React, { useRef } from "react";
import { useTodoStore } from "../../stores/toDoStore";
import { useUIStore } from "../../stores/uiStore";
import { useFiltersStore } from "../../stores/filtersStore";

type FolderItemProps = {
    folder: Folder;
};

const FolderItem: React.FC<FolderItemProps> = ({ folder }) => {
    // Get what we need from stores
    const { updateFolder, updateFolderColor, updateFolderDescription, deleteFolder, getFolderCount } = useTodoStore();
    // Select only the pieces of UI state we need. Split into selectors so
    // most FolderItem instances don't re-render on edit color changes.
    const editingFolder = useUIStore(state => state.editingFolder)
    const editFolderName = useUIStore(state => state.editFolderName)
    const editFolderColor = useUIStore(state => state.editingFolder?.id === folder.id ? state.editFolderColor : '')
    const editFolderDescription = useUIStore(state => state.editingFolder?.id === folder.id ? state.editFolderDescription : '')
    const startEditingFolder = useUIStore(state => state.startEditingFolder)
    const updateEditFolderName = useUIStore(state => state.updateEditFolderName)
    const updateEditFolderColor = useUIStore(state => state.updateEditFolderColor)
    const updateEditFolderDescription = useUIStore(state => state.updateEditFolderDescription)
    const cancelEditingFolder = useUIStore(state => state.cancelEditingFolder)
    const { filterFolder, setFilterFolder } = useFiltersStore();
    const colorInputRef = useRef<HTMLInputElement | null>(null)

    const handleUpdateFolder = async () => {
        if (!editingFolder || !editFolderName.trim()) return;
        const normalized = editFolderName.trim().toLowerCase()
        if (normalized === 'default') {
            // Guard anyway in case
            alert('You cannot rename a folder to "Default".')
            return
        }
        await updateFolder(editingFolder.id, editFolderName.trim());
        if ((editingFolder.color || '') !== (editFolderColor || '')) {
            await updateFolderColor(editingFolder.id, editFolderColor || '')
        }
        if ((editingFolder.description || '') !== (editFolderDescription || '')) {
            await updateFolderDescription(editingFolder.id, editFolderDescription || '')
        }
        cancelEditingFolder();
    };

    const handleDeleteFolder = async () => {
        if (isDefault) {
            // Guard anyway in case
            alert("The default folder cannot be deleted.")
            return
        }

        if (window.confirm("Are you sure you want to delete this folder and all its contents?")) {
            await deleteFolder(folder.id);
        }
    };

    const handleEditFolder = () => {
        if (isDefault) {
            // Prevent editing the default folder
            alert("The default folder cannot be renamed.")
            return
        }
        startEditingFolder(folder);
    };

    const handleCancelEdit = () => {
        cancelEditingFolder();
    };
    const isDefault = Boolean(folder.is_default || (folder.name || '').toString().trim().toLowerCase() === 'default')

    // Tooltip text: prefer the live edit description when editing, otherwise use folder.description
    const tooltip = (editingFolder?.id === folder.id)
        ? (editFolderDescription || folder.description || '')
        : (folder.description || '')

    return (
        <div
            key={folder.id}
            className={`folder-card ${filterFolder === folder.id ? 'selected' : ''}`}
            title={editingFolder?.id === folder.id ? undefined : tooltip}
        >
            {/* Only show the styled tooltip when not actively editing this folder to avoid
                obstructing the edit form. */}
            {editingFolder?.id !== folder.id && tooltip && tooltip.trim() !== '' && (
                <div className="folder-tooltip" role="tooltip">{tooltip}</div>
            )}
            {/* Wrapper to position the color input so the native picker opens beneath the square */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                    className="folder-color"
                    style={{ backgroundColor: (editingFolder?.id === folder.id) ? (editFolderColor || folder.color || '#A8BBA0') : (folder.color || '#A8BBA0') }}
                    onClick={(e) => {
                        // Only allow editing the color when this folder is in edit mode.
                        e.stopPropagation()
                        if (editingFolder?.id === folder.id) {
                            colorInputRef.current?.click()
                        } else {
                            // behave like before: set filter when not editing
                            setFilterFolder(folder.id)
                        }
                    }}
                ></div>

                {/* Single invisible but positioned color input. Not display:none so the browser can anchor the
                    native color picker near this element; we position it beneath the color square. */}
                <input
                    ref={colorInputRef}
                    key={`edit-${folder.id}`}
                    type="color"
                    value={
                        (editingFolder?.id === folder.id)
                            ? (editFolderColor || folder.color || '#A8BBA0')
                            : (folder.color || '#A8BBA0')
                    }
                    onChange={(e) => {
                        e.stopPropagation()
                        const val = e.target.value
                        // Only update the edit color state — saving persists it
                        updateEditFolderColor(val)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: '100%',
                        marginTop: 6,
                        width: 28,
                        height: 28,
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        opacity: 0,
                        cursor: 'pointer'
                    }}
                />
            </div>
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
                        <textarea
                            className="folder-edit-description"
                            placeholder="Optional description"
                            value={editFolderDescription}
                            onChange={(e) => updateEditFolderDescription(e.target.value)}
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
                            {isDefault ? (
                                <>
                                    <button className="folder-edit-btn" disabled title="Default folder cannot be renamed">✏️</button>
                                    <button className="folder-delete-btn" disabled title="Default folder cannot be deleted">🗑️</button>
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default FolderItem