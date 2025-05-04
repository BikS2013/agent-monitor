import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Bot, Plus, Trash2 } from 'lucide-react';

interface NewAIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewAIAgentModal: React.FC<NewAIAgentModalProps> = ({ isOpen, onClose }) => {
  const { addAIAgent } = useData();
  
  const [name, setName] = useState('');
  const [model, setModel] = useState('GPT-4-Turbo');
  const [capabilities, setCapabilities] = useState<string[]>(['general-inquiries']);
  const [specializations, setSpecializations] = useState<string[]>(['customer-service']);
  const [newCapability, setNewCapability] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  
  const handleAddCapability = () => {
    if (newCapability.trim() && !capabilities.includes(newCapability.trim())) {
      setCapabilities([...capabilities, newCapability.trim()]);
      setNewCapability('');
    }
  };
  
  const handleRemoveCapability = (capability: string) => {
    setCapabilities(capabilities.filter(c => c !== capability));
  };
  
  const handleAddSpecialization = () => {
    if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };
  
  const handleRemoveSpecialization = (specialization: string) => {
    setSpecializations(specializations.filter(s => s !== specialization));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new AI agent
    addAIAgent({
      name,
      model,
      status: 'active',
      conversationsProcessed: 0,
      successRate: '0%',
      avgResponseTime: '0s',
      lastActive: 'Just now',
      capabilities,
      specializations
    });
    
    // Reset form and close modal
    setName('');
    setModel('GPT-4-Turbo');
    setCapabilities(['general-inquiries']);
    setSpecializations(['customer-service']);
    setNewCapability('');
    setNewSpecialization('');
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New AI Agent" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot size={24} className="text-blue-600" />
            </div>
            
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
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
          </div>
          
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              AI Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GPT-4-Turbo">GPT-4-Turbo</option>
              <option value="Claude-3-Opus">Claude-3-Opus</option>
              <option value="Claude-3-Sonnet">Claude-3-Sonnet</option>
              <option value="GPT-3.5-Turbo">GPT-3.5-Turbo</option>
              <option value="Llama-3-70B">Llama-3-70B</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capabilities
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  placeholder="Add capability"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCapability}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded mb-1 last:mb-0">
                    <span className="text-sm">{capability}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCapability(capability)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {capabilities.length === 0 && (
                  <div className="text-center text-gray-500 py-2 text-sm">
                    No capabilities added
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specializations
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Add specialization"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSpecialization}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto">
                {specializations.map((specialization, index) => (
                  <div key={index} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded mb-1 last:mb-0">
                    <span className="text-sm">{specialization}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialization(specialization)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {specializations.length === 0 && (
                  <div className="text-center text-gray-500 py-2 text-sm">
                    No specializations added
                  </div>
                )}
              </div>
            </div>
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
              Create AI Agent
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NewAIAgentModal;
