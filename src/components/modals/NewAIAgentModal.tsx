import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAIAgentsData } from '../../context/AIAgentsDataContext';
import { Bot, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NewAIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewAIAgentModal: React.FC<NewAIAgentModalProps> = ({ isOpen, onClose }) => {
  const { createAIAgent } = useAIAgentsData();
  const { theme } = useTheme();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create new AI agent
      await createAIAgent({
        name,
        model, // Use model to match the AIAgent interface
        status: 'active',
        conversationsProcessed: 0,
        successRate: '0%',
        avgResponseTime: '0m',
        lastActive: new Date().toISOString(),
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
    } catch (error) {
      console.error('Failed to create AI agent:', error);
      // You could add error handling UI here if needed
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New AI Agent" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'
            }`}>
              <Bot size={24} className={theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} />
            </div>

            <div className="flex-1">
              <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Agent Name
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
          </div>

          <div>
            <label htmlFor="model" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              AI Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
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
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Capabilities
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  placeholder="Add capability"
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddCapability}
                  className={`p-2 text-white rounded-md ${
                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className={`border rounded-md p-2 max-h-32 overflow-y-auto ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}>
                {capabilities.map((capability, index) => (
                  <div key={index} className={`flex items-center justify-between py-1 px-2 rounded mb-1 last:mb-0 ${
                    theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                  }`}>
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{capability}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCapability(capability)}
                      className={theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {capabilities.length === 0 && (
                  <div className={`text-center py-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No capabilities added
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Specializations
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Add specialization"
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddSpecialization}
                  className={`p-2 text-white rounded-md ${
                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className={`border rounded-md p-2 max-h-32 overflow-y-auto ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}>
                {specializations.map((specialization, index) => (
                  <div key={index} className={`flex items-center justify-between py-1 px-2 rounded mb-1 last:mb-0 ${
                    theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                  }`}>
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{specialization}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialization(specialization)}
                      className={theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {specializations.length === 0 && (
                  <div className={`text-center py-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No specializations added
                  </div>
                )}
              </div>
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
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              }`}
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
