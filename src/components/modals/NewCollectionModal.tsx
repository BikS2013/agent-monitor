import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';

interface NewCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewCollectionModal: React.FC<NewCollectionModalProps> = ({ isOpen, onClose }) => {
  const { addCollection, getCurrentUser } = useData();
  const currentUser = getCurrentUser();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filterType, setFilterType] = useState<'aiAgent' | 'time' | 'outcome' | 'multiFactor'>('aiAgent');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create filter criteria based on selected filter type
    const filterCriteria: any = {};
    
    if (filterType === 'aiAgent') {
      filterCriteria.aiAgentBased = ['ai1']; // Default to first AI agent
    } else if (filterType === 'time') {
      filterCriteria.timeBased = {
        period: 'today'
      };
    } else if (filterType === 'outcome') {
      filterCriteria.outcomeBased = 'all';
    } else {
      filterCriteria.multiFactorFilters = [{ priority: 'high' }];
    }
    
    // Create new collection
    addCollection({
      name,
      description,
      filterCriteria,
      creationTimestamp: new Date().toISOString(),
      creator: currentUser.id,
      accessPermissions: [currentUser.id],
      metadata: {
        totalConversations: 0,
        avgDuration: '0m'
      },
      conversations: []
    });
    
    // Reset form and close modal
    setName('');
    setDescription('');
    setFilterType('aiAgent');
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Collection">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="aiAgent">AI Agent Based</option>
              <option value="time">Time Based</option>
              <option value="outcome">Outcome Based</option>
              <option value="multiFactor">Multi-Factor</option>
            </select>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Collection
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NewCollectionModal;
