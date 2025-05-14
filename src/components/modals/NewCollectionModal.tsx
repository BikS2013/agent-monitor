import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Collection, User } from '../../data/types';
import { Calendar, Bot, CheckCircle, Filter, Plus, Trash2, MessageCircle, AlertCircle } from 'lucide-react';
import { filterConversationsByCollectionCriteria } from '../../data/filterUtils';
import { useTheme } from '../../context/ThemeContext';

interface NewCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionToEdit?: Collection | null;
}

const NewCollectionModal: React.FC<NewCollectionModalProps> = ({ isOpen, onClose, collectionToEdit }) => {
  const { addCollection, getCurrentUser, aiAgents, conversations } = useData();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchUser();
  }, [getCurrentUser]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filterType, setFilterType] = useState<'aiAgent' | 'time' | 'outcome' | 'multiFactor'>('aiAgent');

  // AI Agent based filter options
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  // Time based filter options
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Multi-factor time filter options (separate from main time filter)
  const [multiFactorTimePeriod, setMultiFactorTimePeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('today');
  const [multiFactorStartDate, setMultiFactorStartDate] = useState('');
  const [multiFactorEndDate, setMultiFactorEndDate] = useState('');

  // Track if the form has been touched to prevent premature filtering
  const [formTouched, setFormTouched] = useState(false);

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
    // Reset form touched state when modal opens/closes
    setFormTouched(false);

    console.log('Collection to edit:', collectionToEdit);

    if (collectionToEdit) {
      setName(collectionToEdit.name);
      setDescription(collectionToEdit.description);

      // Determine filter type and set appropriate values
      if (collectionToEdit.filterCriteria.aiAgentBased) {
        setFilterType('aiAgent');
        setSelectedAgents([...collectionToEdit.filterCriteria.aiAgentBased]); // Create a new array to avoid reference issues
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
        const hasAgentFilter = filters.some(f => f.agentId || f.agentIds);
        const hasTimeFilter = filters.some(f => f.timeRange);
        const hasOutcomeFilter = filters.some(f => f.outcome);
        const hasPriorityFilter = filters.some(f => f.priority);

        setIncludeAgentFilter(hasAgentFilter);
        setIncludeTimeFilter(hasTimeFilter);
        setIncludeOutcomeFilter(hasOutcomeFilter);
        setIncludePriorityFilter(hasPriorityFilter);

        // Set specific values if available
        if (hasAgentFilter) {
          const agentFilter = filters.find(f => f.agentId || f.agentIds);
          if (agentFilter) {
            if (agentFilter.agentId) {
              // For backward compatibility
              setSelectedAgents([agentFilter.agentId]);
            } else if (agentFilter.agentIds && agentFilter.agentIds.length > 0) {
              // New format with multiple agent IDs
              setSelectedAgents([...agentFilter.agentIds]);
            }
          }
        }

        if (hasTimeFilter) {
          const timeFilter = filters.find(f => f.timeRange);
          if (timeFilter && timeFilter.timeRange) {
            if (timeFilter.timeRange.period) {
              setMultiFactorTimePeriod(timeFilter.timeRange.period as any);
            } else if (timeFilter.timeRange.startDate && timeFilter.timeRange.endDate) {
              setMultiFactorTimePeriod('custom');
              setMultiFactorStartDate(timeFilter.timeRange.startDate);
              setMultiFactorEndDate(timeFilter.timeRange.endDate);
            }
          }
        }

        if (hasOutcomeFilter) {
          const outcomeFilter = filters.find(f => f.outcome);
          if (outcomeFilter) {
            setOutcomeType(outcomeFilter.outcome as any);
          }
        }

        if (hasPriorityFilter) {
          const priorityFilter = filters.find(f => f.priority);
          if (priorityFilter) {
            setPriorityLevel(priorityFilter.priority);
          }
        }
      }

      // Set form as touched since we're editing an existing collection
      setFormTouched(true);
    } else {
      // Default values for new collection
      setName('');
      setDescription('');
      setFilterType('aiAgent');
      setSelectedAgents(Object.keys(aiAgents).length > 0 ? [Object.keys(aiAgents)[0]] : []);
      setTimePeriod('today');
      setCustomStartDate('');
      setCustomEndDate('');
      setMultiFactorTimePeriod('today');
      setMultiFactorStartDate('');
      setMultiFactorEndDate('');
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

    // Set form as touched to ensure filtering happens
    setFormTouched(true);

    // Get the current filter criteria
    const filterCriteria = getCurrentFilterCriteria();

    // Create new collection or update existing one
    const collectionData: any = {
      name,
      description,
      filterCriteria,
      creationTimestamp: collectionToEdit?.creationTimestamp || new Date().toISOString(),
      creator: collectionToEdit?.creator || (currentUser ? currentUser.id : ''),
      accessPermissions: collectionToEdit?.accessPermissions || (currentUser ? [currentUser.id] : []),
      metadata: collectionToEdit?.metadata || {
        totalConversations: 0,
        avgDuration: '0m'
      },
      conversations: collectionToEdit?.conversations || []
    };

    // Include the ID if we're editing an existing collection
    if (collectionToEdit?.id) {
      collectionData.id = collectionToEdit.id;
      console.log('Updating existing collection with ID:', collectionToEdit.id);
    } else {
      console.log('Creating new collection');
    }

    console.log('Collection data to save:', collectionData);

    // Add the collection
    try {
      const result = addCollection(collectionData);
      console.log('Collection saved successfully:', result);

      // Reset form and close modal
      setName('');
      setDescription('');
      setFilterType('aiAgent');
      setSelectedAgents([]);
      setTimePeriod('today');
      setCustomStartDate('');
      setCustomEndDate('');
      setMultiFactorTimePeriod('today');
      setMultiFactorStartDate('');
      setMultiFactorEndDate('');
      setOutcomeType('all');
      setIncludeAgentFilter(false);
      setIncludeTimeFilter(false);
      setIncludeOutcomeFilter(false);
      setIncludePriorityFilter(true);
      setPriorityLevel('high');
      onClose();
    } catch (error) {
      console.error('Error saving collection:', error);
    }
  };

  // Helper function to toggle agent selection
  const toggleAgentSelection = (agentId: string) => {
    setFormTouched(true);
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
          agentIds: selectedAgents.length > 0 ? selectedAgents : [Object.keys(aiAgents)[0]]
        });
      }

      if (includeTimeFilter) {
        const timeFilter: any = { timeRange: {} };

        if (multiFactorTimePeriod === 'custom') {
          timeFilter.timeRange.startDate = multiFactorStartDate;
          timeFilter.timeRange.endDate = multiFactorEndDate;
        } else {
          timeFilter.timeRange.period = multiFactorTimePeriod;
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
    // Only filter if the form has been touched to prevent premature filtering
    if (!formTouched) {
      return [];
    }

    const filterCriteria = getCurrentFilterCriteria();
    return filterConversationsByCollectionCriteria(conversations, filterCriteria);
  }, [
    formTouched,
    conversations,
    filterType,
    selectedAgents,
    timePeriod,
    customStartDate,
    customEndDate,
    multiFactorTimePeriod,
    multiFactorStartDate,
    multiFactorEndDate,
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
          <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-md p-3 max-h-60 overflow-y-auto ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <h4 className={`font-medium text-sm mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Bot size={16} className="text-blue-500 mr-1" />
              Select AI Agents
            </h4>
            {Object.values(aiAgents).map((agent) => (
              <div key={agent.id} className={`flex items-center py-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} border-b last:border-b-0`}>
                <input
                  type="checkbox"
                  id={`agent-${agent.id}`}
                  checked={selectedAgents.includes(agent.id)}
                  onChange={() => toggleAgentSelection(agent.id)}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-500 bg-gray-600' : 'border-gray-300'} rounded`}
                />
                <label htmlFor={`agent-${agent.id}`} className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {agent.name} ({agent.model})
                </label>
              </div>
            ))}
          </div>
        );

      case 'time':
        return (
          <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-md p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <h4 className={`font-medium text-sm mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Calendar size={16} className="text-blue-500 mr-1" />
              Time Period
            </h4>
            <div className="space-y-2">
              <div>
                <select
                  value={timePeriod}
                  onChange={(e) => {
                    setFormTouched(true);
                    setTimePeriod(e.target.value as any);
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="today">Today</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {timePeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label htmlFor="startDate" className={`block text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-1`}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={customStartDate}
                      onChange={(e) => {
                        setFormTouched(true);
                        setCustomStartDate(e.target.value);
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-md ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required={timePeriod === 'custom'}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className={`block text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-1`}>
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={customEndDate}
                      onChange={(e) => {
                        setFormTouched(true);
                        setCustomEndDate(e.target.value);
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-md ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
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
          <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-md p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <h4 className={`font-medium text-sm mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <CheckCircle size={16} className="text-blue-500 mr-1" />
              Conversation Outcome
            </h4>
            <div>
              <select
                value={outcomeType}
                onChange={(e) => {
                  setFormTouched(true);
                  setOutcomeType(e.target.value as any);
                }}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="successful">Successful</option>
                <option value="unsuccessful">Unsuccessful</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        );

      case 'multiFactor':
        return (
          <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-md p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <h4 className={`font-medium text-sm mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Filter size={16} className="text-blue-500 mr-1" />
              Multi-Factor Filters
            </h4>

            <div className="space-y-3">
              <div className={`flex items-center justify-between p-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} rounded`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="agentFilter"
                    checked={includeAgentFilter}
                    onChange={(e) => {
                      setFormTouched(true);
                      setIncludeAgentFilter(e.target.checked);
                    }}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-500 bg-gray-600' : 'border-gray-300'} rounded`}
                  />
                  <label htmlFor="agentFilter" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    AI Agent Filter
                  </label>
                </div>
                <Bot size={16} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} />
              </div>

              {includeAgentFilter && (
                <div className={`ml-6 border-l-2 ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'} pl-3`}>
                  <div className="max-h-32 overflow-y-auto">
                    {Object.values(aiAgents).map((agent) => (
                      <div key={agent.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          id={`multi-agent-${agent.id}`}
                          checked={selectedAgents.includes(agent.id)}
                          onChange={() => toggleAgentSelection(agent.id)}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-500 bg-gray-600' : 'border-gray-300'} rounded`}
                        />
                        <label htmlFor={`multi-agent-${agent.id}`} className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                          {agent.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`flex items-center justify-between p-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} rounded`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="timeFilter"
                    checked={includeTimeFilter}
                    onChange={(e) => {
                      setFormTouched(true);
                      setIncludeTimeFilter(e.target.checked);
                    }}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-500 bg-gray-600' : 'border-gray-300'} rounded`}
                  />
                  <label htmlFor="timeFilter" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Time Period Filter
                  </label>
                </div>
                <Calendar size={16} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} />
              </div>

              {includeTimeFilter && (
                <div className={`ml-6 border-l-2 ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'} pl-3`}>
                  <div>
                    <select
                      value={multiFactorTimePeriod}
                      onChange={(e) => {
                        setFormTouched(true);
                        setMultiFactorTimePeriod(e.target.value as any);
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="today">Today</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="quarter">Last Quarter</option>
                      <option value="year">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {multiFactorTimePeriod === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label htmlFor="multiStartDate" className={`block text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-1`}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="multiStartDate"
                          value={multiFactorStartDate}
                          onChange={(e) => {
                            setFormTouched(true);
                            setMultiFactorStartDate(e.target.value);
                          }}
                          className={`w-full px-3 py-2 text-sm border rounded-md ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          required={multiFactorTimePeriod === 'custom'}
                        />
                      </div>
                      <div>
                        <label htmlFor="multiEndDate" className={`block text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-1`}>
                          End Date
                        </label>
                        <input
                          type="date"
                          id="multiEndDate"
                          value={multiFactorEndDate}
                          onChange={(e) => {
                            setFormTouched(true);
                            setMultiFactorEndDate(e.target.value);
                          }}
                          className={`w-full px-3 py-2 text-sm border rounded-md ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          required={multiFactorTimePeriod === 'custom'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={`flex items-center justify-between p-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} rounded`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="outcomeFilter"
                    checked={includeOutcomeFilter}
                    onChange={(e) => {
                      setFormTouched(true);
                      setIncludeOutcomeFilter(e.target.checked);
                    }}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-500 bg-gray-600' : 'border-gray-300'} rounded`}
                  />
                  <label htmlFor="outcomeFilter" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Outcome Filter
                  </label>
                </div>
                <CheckCircle size={16} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} />
              </div>

              {includeOutcomeFilter && (
                <div className={`ml-6 border-l-2 ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'} pl-3`}>
                  <div>
                    <select
                      value={outcomeType}
                      onChange={(e) => {
                        setFormTouched(true);
                        setOutcomeType(e.target.value as any);
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="successful">Successful</option>
                      <option value="unsuccessful">Unsuccessful</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                </div>
              )}

              <div className={`flex items-center justify-between p-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} rounded`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="priorityFilter"
                    checked={includePriorityFilter}
                    onChange={(e) => {
                      setFormTouched(true);
                      setIncludePriorityFilter(e.target.checked);
                    }}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-500 bg-gray-600' : 'border-gray-300'} rounded`}
                  />
                  <label htmlFor="priorityFilter" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Priority Filter
                  </label>
                </div>
                <Filter size={16} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} />
              </div>

              {includePriorityFilter && (
                <div className={`ml-6 border-l-2 ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'} pl-3`}>
                  <div>
                    <select
                      value={priorityLevel}
                      onChange={(e) => {
                        setFormTouched(true);
                        setPriorityLevel(e.target.value as any);
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
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
            <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Collection Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setFormTouched(true);
                setName(e.target.value);
              }}
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
              onChange={(e) => {
                setFormTouched(true);
                setDescription(e.target.value);
              }}
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
              Filter Type
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFormTouched(true);
                setFilterType(e.target.value as any);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
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
          <div className={`border rounded-md p-3 ${
            theme === 'dark'
              ? 'border-gray-600 bg-gray-700'
              : 'border-gray-300 bg-gray-50'
          }`}>
            <h4 className={`font-medium text-sm mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <MessageCircle size={16} className="text-blue-500 mr-1" />
              Matching Conversations Preview
            </h4>

            {matchingConversationIds.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {matchingConversationIds.length} conversations match these criteria
                  </span>
                </div>

                <div className={`max-h-32 overflow-y-auto rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-600'
                    : 'bg-white border-gray-200'
                }`}>
                  {matchingConversationIds.slice(0, 5).map(id => {
                    const conversation = conversations[id];
                    return (
                      <div key={id} className={`p-2 text-sm ${
                        theme === 'dark'
                          ? 'border-gray-600 border-b last:border-b-0'
                          : 'border-gray-200 border-b last:border-b-0'
                      }`}>
                        <div className="flex justify-between">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {conversation.thread_id}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            theme === 'dark' ? (
                              conversation.conclusion === 'successful' ? 'bg-green-900 text-green-300' :
                              conversation.conclusion === 'unsuccessful' ? 'bg-red-900 text-red-300' :
                              'bg-yellow-900 text-yellow-300'
                            ) : (
                              conversation.conclusion === 'successful' ? 'bg-green-100 text-green-800' :
                              conversation.conclusion === 'unsuccessful' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            )
                          }`}>
                            {conversation.conclusion}
                          </span>
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {conversation.userName} with {conversation.aiAgentName}
                        </div>
                      </div>
                    );
                  })}

                  {matchingConversationIds.length > 5 && (
                    <div className={`p-2 text-center text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      + {matchingConversationIds.length - 5} more conversations
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`flex items-center justify-center p-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <AlertCircle size={16} className="mr-2 text-yellow-500" />
                <span>No conversations match these criteria</span>
              </div>
            )}
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
              {submitButtonText}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NewCollectionModal;
