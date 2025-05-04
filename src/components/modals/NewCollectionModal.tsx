import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Collection, AIAgent, Conversation } from '../../data/types';
import { Calendar, Bot, CheckCircle, Filter, Plus, Trash2, MessageCircle, AlertCircle } from 'lucide-react';
import { filterConversationsByCollectionCriteria } from '../../data/filterUtils';

interface NewCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionToEdit?: Collection | null;
}

const NewCollectionModal: React.FC<NewCollectionModalProps> = ({ isOpen, onClose, collectionToEdit }) => {
  const { addCollection, getCurrentUser, aiAgents, conversations } = useData();
  const currentUser = getCurrentUser();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filterType, setFilterType] = useState<'aiAgent' | 'time' | 'outcome' | 'multiFactor'>('aiAgent');

  // AI Agent based filter options
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  // Time based filter options
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Outcome based filter options
  const [outcomeType, setOutcomeType] = useState<'successful' | 'unsuccessful' | 'all'>('all');

  // Multi-factor filter options
  const [includeAgentFilter, setIncludeAgentFilter] = useState(false);
  const [includeTimeFilter, setIncludeTimeFilter] = useState(false);
  const [includeOutcomeFilter, setIncludeOutcomeFilter] = useState(false);
  const [includePriorityFilter, setIncludePriorityFilter] = useState(false);
  const [priorityLevel, setPriorityLevel] = useState<'low' | 'medium' | 'high'>('high');

  // Initialize form with collection data if editing
  useEffect(() => {
    if (collectionToEdit) {
      setName(collectionToEdit.name);
      setDescription(collectionToEdit.description);

      // Determine filter type and set appropriate values
      if (collectionToEdit.filterCriteria.aiAgentBased) {
        setFilterType('aiAgent');
        setSelectedAgents(collectionToEdit.filterCriteria.aiAgentBased);
      } else if (collectionToEdit.filterCriteria.timeBased) {
        setFilterType('time');
        const timeCriteria = collectionToEdit.filterCriteria.timeBased;
        if (timeCriteria.period) {
          setTimePeriod(timeCriteria.period as any);
        } else if (timeCriteria.startDate && timeCriteria.endDate) {
          setTimePeriod('custom');
          setCustomStartDate(timeCriteria.startDate);
          setCustomEndDate(timeCriteria.endDate);
        }
      } else if (collectionToEdit.filterCriteria.outcomeBased) {
        setFilterType('outcome');
        setOutcomeType(collectionToEdit.filterCriteria.outcomeBased);
      } else if (collectionToEdit.filterCriteria.multiFactorFilters) {
        setFilterType('multiFactor');
        const filters = collectionToEdit.filterCriteria.multiFactorFilters;

        // Check which filters are included
        const hasAgentFilter = filters.some(f => f.agentId);
        const hasTimeFilter = filters.some(f => f.timeRange);
        const hasOutcomeFilter = filters.some(f => f.outcome);
        const hasPriorityFilter = filters.some(f => f.priority);

        setIncludeAgentFilter(hasAgentFilter);
        setIncludeTimeFilter(hasTimeFilter);
        setIncludeOutcomeFilter(hasOutcomeFilter);
        setIncludePriorityFilter(hasPriorityFilter);

        // Set specific values if available
        if (hasPriorityFilter) {
          const priorityFilter = filters.find(f => f.priority);
          if (priorityFilter) {
            setPriorityLevel(priorityFilter.priority);
          }
        }
      }
    } else {
      // Default values for new collection
      setName('');
      setDescription('');
      setFilterType('aiAgent');
      setSelectedAgents([Object.keys(aiAgents)[0]]);
      setTimePeriod('today');
      setCustomStartDate('');
      setCustomEndDate('');
      setOutcomeType('all');
      setIncludeAgentFilter(false);
      setIncludeTimeFilter(false);
      setIncludeOutcomeFilter(false);
      setIncludePriorityFilter(true);
      setPriorityLevel('high');
    }
  }, [collectionToEdit, isOpen, aiAgents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get the current filter criteria
    const filterCriteria = getCurrentFilterCriteria();

    // Create new collection or update existing one
    const collectionData: any = {
      name,
      description,
      filterCriteria,
      creationTimestamp: collectionToEdit?.creationTimestamp || new Date().toISOString(),
      creator: collectionToEdit?.creator || currentUser.id,
      accessPermissions: collectionToEdit?.accessPermissions || [currentUser.id],
      metadata: collectionToEdit?.metadata || {
        totalConversations: 0,
        avgDuration: '0m'
      },
      conversations: collectionToEdit?.conversations || []
    };

    // Include the ID if we're editing an existing collection
    if (collectionToEdit?.id) {
      collectionData.id = collectionToEdit.id;
    }

    // Add the collection
    addCollection(collectionData);

    // Reset form and close modal
    setName('');
    setDescription('');
    setFilterType('aiAgent');
    setSelectedAgents([]);
    setTimePeriod('today');
    setCustomStartDate('');
    setCustomEndDate('');
    setOutcomeType('all');
    setIncludeAgentFilter(false);
    setIncludeTimeFilter(false);
    setIncludeOutcomeFilter(false);
    setIncludePriorityFilter(true);
    setPriorityLevel('high');
    onClose();
  };

  // Helper function to toggle agent selection
  const toggleAgentSelection = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  // Create filter criteria based on current form state
  const getCurrentFilterCriteria = () => {
    const filterCriteria: any = {};

    if (filterType === 'aiAgent') {
      filterCriteria.aiAgentBased = selectedAgents.length > 0 ? selectedAgents : [Object.keys(aiAgents)[0]];
    } else if (filterType === 'time') {
      filterCriteria.timeBased = {};

      if (timePeriod === 'custom') {
        filterCriteria.timeBased.startDate = customStartDate;
        filterCriteria.timeBased.endDate = customEndDate;
      } else {
        filterCriteria.timeBased.period = timePeriod;
      }
    } else if (filterType === 'outcome') {
      filterCriteria.outcomeBased = outcomeType;
    } else {
      // Multi-factor filters
      filterCriteria.multiFactorFilters = [];

      if (includeAgentFilter) {
        filterCriteria.multiFactorFilters.push({
          agentId: selectedAgents.length > 0 ? selectedAgents[0] : Object.keys(aiAgents)[0]
        });
      }

      if (includeTimeFilter) {
        const timeFilter: any = { timeRange: {} };

        if (timePeriod === 'custom') {
          timeFilter.timeRange.startDate = customStartDate;
          timeFilter.timeRange.endDate = customEndDate;
        } else {
          timeFilter.timeRange.period = timePeriod;
        }

        filterCriteria.multiFactorFilters.push(timeFilter);
      }

      if (includeOutcomeFilter) {
        filterCriteria.multiFactorFilters.push({ outcome: outcomeType });
      }

      if (includePriorityFilter) {
        filterCriteria.multiFactorFilters.push({ priority: priorityLevel });
      }

      // If no filters were selected, add a default one
      if (filterCriteria.multiFactorFilters.length === 0) {
        filterCriteria.multiFactorFilters.push({ priority: 'high' });
      }
    }

    return filterCriteria;
  };

  // Get matching conversations based on current filter criteria
  const matchingConversationIds = useMemo(() => {
    const filterCriteria = getCurrentFilterCriteria();
    return filterConversationsByCollectionCriteria(conversations, filterCriteria);
  }, [
    conversations,
    filterType,
    selectedAgents,
    timePeriod,
    customStartDate,
    customEndDate,
    outcomeType,
    includeAgentFilter,
    includeTimeFilter,
    includeOutcomeFilter,
    includePriorityFilter,
    priorityLevel
  ]);

  // Render filter options based on selected filter type
  const renderFilterOptions = () => {
    switch (filterType) {
      case 'aiAgent':
        return (
          <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Bot size={16} className="text-blue-500 mr-1" />
              Select AI Agents
            </h4>
            {Object.values(aiAgents).map((agent) => (
              <div key={agent.id} className="flex items-center py-2 border-b last:border-b-0">
                <input
                  type="checkbox"
                  id={`agent-${agent.id}`}
                  checked={selectedAgents.includes(agent.id)}
                  onChange={() => toggleAgentSelection(agent.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`agent-${agent.id}`} className="ml-2 block text-sm">
                  {agent.name} ({agent.model})
                </label>
              </div>
            ))}
          </div>
        );

      case 'time':
        return (
          <div className="border border-gray-300 rounded-md p-3">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Calendar size={16} className="text-blue-500 mr-1" />
              Time Period
            </h4>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTimePeriod('today')}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    timePeriod === 'today' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setTimePeriod('week')}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    timePeriod === 'week' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  Last Week
                </button>
                <button
                  type="button"
                  onClick={() => setTimePeriod('month')}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    timePeriod === 'month' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  Last Month
                </button>
                <button
                  type="button"
                  onClick={() => setTimePeriod('quarter')}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    timePeriod === 'quarter' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  Last Quarter
                </button>
                <button
                  type="button"
                  onClick={() => setTimePeriod('year')}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    timePeriod === 'year' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  Last Year
                </button>
                <button
                  type="button"
                  onClick={() => setTimePeriod('custom')}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    timePeriod === 'custom' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  Custom Range
                </button>
              </div>

              {timePeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label htmlFor="startDate" className="block text-xs text-gray-500 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                      required={timePeriod === 'custom'}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-xs text-gray-500 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                      required={timePeriod === 'custom'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'outcome':
        return (
          <div className="border border-gray-300 rounded-md p-3">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <CheckCircle size={16} className="text-blue-500 mr-1" />
              Conversation Outcome
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOutcomeType('successful')}
                className={`px-3 py-2 text-sm border rounded-md ${
                  outcomeType === 'successful' ? 'bg-green-50 border-green-500' : 'border-gray-300'
                }`}
              >
                Successful
              </button>
              <button
                type="button"
                onClick={() => setOutcomeType('unsuccessful')}
                className={`px-3 py-2 text-sm border rounded-md ${
                  outcomeType === 'unsuccessful' ? 'bg-red-50 border-red-500' : 'border-gray-300'
                }`}
              >
                Unsuccessful
              </button>
              <button
                type="button"
                onClick={() => setOutcomeType('all')}
                className={`px-3 py-2 text-sm border rounded-md ${
                  outcomeType === 'all' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                }`}
              >
                All
              </button>
            </div>
          </div>
        );

      case 'multiFactor':
        return (
          <div className="border border-gray-300 rounded-md p-3">
            <h4 className="font-medium text-sm mb-3 flex items-center">
              <Filter size={16} className="text-blue-500 mr-1" />
              Multi-Factor Filters
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="agentFilter"
                    checked={includeAgentFilter}
                    onChange={(e) => setIncludeAgentFilter(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agentFilter" className="ml-2 block text-sm">
                    AI Agent Filter
                  </label>
                </div>
                <Bot size={16} className="text-gray-400" />
              </div>

              {includeAgentFilter && (
                <div className="ml-6 border-l-2 border-blue-200 pl-3">
                  <div className="max-h-32 overflow-y-auto">
                    {Object.values(aiAgents).map((agent) => (
                      <div key={agent.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          id={`multi-agent-${agent.id}`}
                          checked={selectedAgents.includes(agent.id)}
                          onChange={() => toggleAgentSelection(agent.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`multi-agent-${agent.id}`} className="ml-2 block text-sm">
                          {agent.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="timeFilter"
                    checked={includeTimeFilter}
                    onChange={(e) => setIncludeTimeFilter(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="timeFilter" className="ml-2 block text-sm">
                    Time Period Filter
                  </label>
                </div>
                <Calendar size={16} className="text-gray-400" />
              </div>

              {includeTimeFilter && (
                <div className="ml-6 border-l-2 border-blue-200 pl-3">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setTimePeriod('today')}
                      className={`px-2 py-1 text-xs border rounded-md ${
                        timePeriod === 'today' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimePeriod('week')}
                      className={`px-2 py-1 text-xs border rounded-md ${
                        timePeriod === 'week' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      Last Week
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimePeriod('month')}
                      className={`px-2 py-1 text-xs border rounded-md ${
                        timePeriod === 'month' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      Last Month
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="outcomeFilter"
                    checked={includeOutcomeFilter}
                    onChange={(e) => setIncludeOutcomeFilter(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="outcomeFilter" className="ml-2 block text-sm">
                    Outcome Filter
                  </label>
                </div>
                <CheckCircle size={16} className="text-gray-400" />
              </div>

              {includeOutcomeFilter && (
                <div className="ml-6 border-l-2 border-blue-200 pl-3">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setOutcomeType('successful')}
                      className={`px-2 py-1 text-xs border rounded-md ${
                        outcomeType === 'successful' ? 'bg-green-50 border-green-500' : 'border-gray-300'
                      }`}
                    >
                      Successful
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutcomeType('unsuccessful')}
                      className={`px-2 py-1 text-xs border rounded-md ${
                        outcomeType === 'unsuccessful' ? 'bg-red-50 border-red-500' : 'border-gray-300'
                      }`}
                    >
                      Unsuccessful
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutcomeType('all')}
                      className={`px-2 py-1 text-xs border rounded-md ${
                        outcomeType === 'all' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="priorityFilter"
                    checked={includePriorityFilter}
                    onChange={(e) => setIncludePriorityFilter(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="priorityFilter" className="ml-2 block text-sm">
                    Priority Filter
                  </label>
                </div>
                <Filter size={16} className="text-gray-400" />
              </div>

              {includePriorityFilter && (
                <div className="ml-6 border-l-2 border-blue-200 pl-3">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setPriorityLevel('high')}
                      className={`px-2 py-1 text-xs border rounded-md ${
                        priorityLevel === 'high' ? 'bg-red-50 border-red-500' : 'border-gray-300'
                      }`}
                    >
                      High
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriorityLevel('medium')}
                      className={`px-2 py-1 text-xs border rounded-md ${
                        priorityLevel === 'medium' ? 'bg-yellow-50 border-yellow-500' : 'border-gray-300'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriorityLevel('low')}
                      className={`px-2 py-1 text-xs border rounded-md ${
                        priorityLevel === 'low' ? 'bg-green-50 border-green-500' : 'border-gray-300'
                      }`}
                    >
                      Low
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const modalTitle = collectionToEdit ? "Edit Collection" : "Create New Collection";
  const submitButtonText = collectionToEdit ? "Update Collection" : "Create Collection";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
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
              rows={2}
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

          {/* Render filter options based on selected filter type */}
          {renderFilterOptions()}

          {/* Preview of matching conversations */}
          <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <MessageCircle size={16} className="text-blue-500 mr-1" />
              Matching Conversations Preview
            </h4>

            {matchingConversationIds.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{matchingConversationIds.length} conversations match these criteria</span>
                </div>

                <div className="max-h-32 overflow-y-auto bg-white rounded border border-gray-200">
                  {matchingConversationIds.slice(0, 5).map(id => {
                    const conversation = conversations[id];
                    return (
                      <div key={id} className="p-2 border-b last:border-b-0 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{conversation.id}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            conversation.conclusion === 'successful' ? 'bg-green-100 text-green-800' :
                            conversation.conclusion === 'unsuccessful' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {conversation.conclusion}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {conversation.userName} with {conversation.aiAgentName}
                        </div>
                      </div>
                    );
                  })}

                  {matchingConversationIds.length > 5 && (
                    <div className="p-2 text-center text-xs text-gray-500">
                      + {matchingConversationIds.length - 5} more conversations
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 text-gray-500">
                <AlertCircle size={16} className="mr-2 text-yellow-500" />
                <span>No conversations match these criteria</span>
              </div>
            )}
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
              disabled={matchingConversationIds.length === 0}
            >
              {submitButtonText}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NewCollectionModal;
