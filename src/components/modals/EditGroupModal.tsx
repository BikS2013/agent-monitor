import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useUnifiedData } from '../../hooks/useUnifiedData';
import { Group, Collection } from '../../data/types';
import { Activity, Shield, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({ isOpen, onClose, group }) => {
  const { updateGroup, collections } = useUnifiedData();
  const { theme } = useTheme();
  
  // Form state
  const [name, setName] = useState(group.name || '');
  const [description, setDescription] = useState(group.description || '');
  const [purpose, setPurpose] = useState(group.purpose || 'general');
  const [selectedCollections, setSelectedCollections] = useState<string[]>(group.collectionIds || []);
  
  // Reset form when group changes
  useEffect(() => {
    if (isOpen) {
      setName(group.name || '');
      setDescription(group.description || '');
      setPurpose(group.purpose || 'general');
      setSelectedCollections(group.collectionIds || []);
    }
  }, [isOpen, group]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedGroup: Group = {
      ...group,
      name,
      description,
      purpose,
      collectionIds: selectedCollections,
    };
    
    updateGroup(updatedGroup);
    onClose();
  };
  
  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Group">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Group Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' 
                ? 'bg-gray-600 border-gray-500 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' 
                ? 'bg-gray-600 border-gray-500 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            rows={2}
            required
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Group Purpose
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPurpose('evaluation')}
              className={`flex items-center p-3 border rounded-md ${
                purpose === 'evaluation' 
                  ? theme === 'dark'
                    ? 'border-purple-700 bg-purple-900 text-purple-300'
                    : 'border-purple-500 bg-purple-50 text-gray-900'
                  : theme === 'dark'
                    ? 'border-gray-600 text-gray-300'
                    : 'border-gray-300 text-gray-900'
              }`}
            >
              <Activity size={20} className="text-purple-500 mr-2" />
              <span>Evaluation</span>
            </button>
            <button
              type="button"
              onClick={() => setPurpose('security')}
              className={`flex items-center p-3 border rounded-md ${
                purpose === 'security' 
                  ? theme === 'dark'
                    ? 'border-red-700 bg-red-900 text-red-300'
                    : 'border-red-500 bg-red-50 text-gray-900'
                  : theme === 'dark'
                    ? 'border-gray-600 text-gray-300'
                    : 'border-gray-300 text-gray-900'
              }`}
            >
              <Shield size={20} className="text-red-500 mr-2" />
              <span>Security</span>
            </button>
            <button
              type="button"
              onClick={() => setPurpose('efficiency')}
              className={`flex items-center p-3 border rounded-md ${
                purpose === 'efficiency' 
                  ? theme === 'dark'
                    ? 'border-green-700 bg-green-900 text-green-300'
                    : 'border-green-500 bg-green-50 text-gray-900'
                  : theme === 'dark'
                    ? 'border-gray-600 text-gray-300'
                    : 'border-gray-300 text-gray-900'
              }`}
            >
              <Zap size={20} className="text-green-500 mr-2" />
              <span>Efficiency</span>
            </button>
          </div>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Select Collections
          </label>
          <div className={`border rounded-md max-h-48 overflow-y-auto ${
            theme === 'dark' 
              ? 'border-gray-600 bg-gray-700' 
              : 'border-gray-300 bg-white'
          }`}>
            {Object.values(collections).length > 0 ? (
              Object.values(collections).map(collection => (
                <div 
                  key={collection.id}
                  className={`flex items-center p-3 ${
                    theme === 'dark' 
                      ? 'border-gray-600 border-b last:border-b-0' 
                      : 'border-gray-200 border-b last:border-b-0'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`collection-${collection.id}`}
                    checked={selectedCollections.includes(collection.id)}
                    onChange={() => handleCollectionToggle(collection.id)}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                      theme === 'dark' 
                        ? 'border-gray-500 bg-gray-600' 
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                  <label 
                    htmlFor={`collection-${collection.id}`}
                    className={`ml-3 block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    {collection.name}
                  </label>
                </div>
              ))
            ) : (
              <div className={`p-3 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No collections available. Create collections first.
              </div>
            )}
          </div>
        </div>
        
        <div className={`pt-4 flex justify-end space-x-3 ${theme === 'dark' ? 'border-t border-gray-600' : ''}`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 border rounded-md ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-md ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditGroupModal;
