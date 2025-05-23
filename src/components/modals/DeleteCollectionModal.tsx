import React from 'react';
import Modal from '../common/Modal';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Collection } from '../../data/types';

interface DeleteCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection | null;
  onConfirmDelete: () => void;
}

const DeleteCollectionModal: React.FC<DeleteCollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
  onConfirmDelete
}) => {
  const { theme } = useTheme();

  if (!collection) return null;

  const handleDelete = () => {
    onConfirmDelete();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Collection"
      size="sm"
    >
      <div className="space-y-4">
        {/* Warning Icon and Message */}
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 p-2 rounded-full ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'}`}>
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div className="flex-1">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete the collection <strong>"{collection.name}"</strong>?
            </p>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              This action cannot be undone. The collection will be permanently removed, but the conversations within it will remain.
            </p>
          </div>
        </div>

        {/* Collection Details */}
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Created by:</dt>
              <dd className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{collection.creator}</dd>
            </div>
            <div className="flex justify-between">
              <dt className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Created on:</dt>
              <dd className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                {new Date(collection.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Conversations:</dt>
              <dd className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                {collection.conversations?.length || collection.conversationIds?.length || 0}
              </dd>
            </div>
          </dl>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 border rounded ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={`px-4 py-2 border border-transparent rounded text-white ${
              theme === 'dark'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-red-600 hover:bg-red-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
          >
            Delete Collection
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteCollectionModal;