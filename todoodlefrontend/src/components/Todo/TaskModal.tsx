import React, { useState, useEffect } from 'react';
import type { Task, Status, Folder } from './types';
import './TaskModal.css';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (id: number) => void;
  folders: Folder[];
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onUpdate, onDelete, folders }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setEditMode(false);
    }
  }, [task]);

  const handleOverlayClick = () => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    // For double clicking outside of mdoal to close it
    // If it's been less than 300ms since the last click, treat it as a double-click
    if (timeDiff < 300) {
      onClose();
      setLastClickTime(0);
    } else {
      setLastClickTime(currentTime);
    }
  };

  const handleSave = () => {
    if (editedTask) {
      onUpdate(editedTask);
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditedTask(task ? { ...task } : null);
    setEditMode(false);
  };

  const handleDelete = () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editMode ? 'Edit Task' : 'Task Details'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={editedTask?.title || ''}
                  onChange={(e) => setEditedTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={editedTask?.description || ''}
                  onChange={(e) => setEditedTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="form-textarea"
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={editedTask?.status || 'NOT_STARTED'}
                  onChange={(e) => setEditedTask(prev => prev ? { ...prev, status: e.target.value as Status } : null)}
                  className="form-select"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="folderId">Folder</label>
                <select
                  id="folderId"
                  value={editedTask?.folderId || ''}
                  onChange={(e) => setEditedTask(prev => prev ? { 
                    ...prev, 
                    folderId: e.target.value === '' ? undefined : Number(e.target.value),
                    folder: e.target.value === '' ? undefined : folders.find(f => f.id === Number(e.target.value))
                  } : null)}
                  className="form-select"
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="task-details">
              <div className="detail-row">
                <span className="detail-label">Title:</span>
                <span className="detail-value">{task.title}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{task.description}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Folder:</span>
                <span className="detail-value">
                  {task.folder ? (
                    <span 
                      className="folder-badge"
                      style={{ backgroundColor: task.folder.color || '#A8BBA0' }}
                    >
                      {task.folder.name}
                    </span>
                  ) : (
                    'No Folder'
                  )}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Task ID:</span>
                <span className="detail-value">#{task.id}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {editMode ? (
            <>
              <button className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setEditMode(true)}>
                Edit
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Delete
              </button>
              <button className="btn-primary" onClick={onClose}>
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
