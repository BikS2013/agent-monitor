import React, { useState, useEffect, useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import ConversationsList from '../components/ConversationsList';
import ConversationDetail from '../components/ConversationDetail';
import { useData } from '../context/DataContext';
import { Conversation, Message } from '../data/types';

interface ConversationsViewProps {
  selectedConversation?: Conversation | null;
  setSelectedConversation?: (conversation: Conversation | null) => void;
}

const ConversationsView: React.FC<ConversationsViewProps> = ({
  selectedConversation: propSelectedConversation,
  setSelectedConversation: propSetSelectedConversation
}) => {
  const { conversations, getMessagesByConversationId, loading } = useData();
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Debug: Log conversations data
  useEffect(() => {
    console.log('ConversationsView: Conversations data', {
      count: Object.keys(conversations).length,
      ids: Object.keys(conversations),
      loading: loading.conversations
    });
  }, [conversations, loading.conversations]);

  // Use the props if provided, otherwise use local state from context
  const [localSelectedConversation, setLocalSelectedConversation] = useState<Conversation | null>(null);

  // Use either the prop or local state
  const selectedConversation = propSelectedConversation !== undefined ? propSelectedConversation : localSelectedConversation;
  const setSelectedConversation = propSetSelectedConversation || setLocalSelectedConversation;

  // Only auto-select the first conversation if there's no selected conversation
  // This preserves the selection when navigating from Collections view
  useEffect(() => {
    // Only auto-select if we have conversations and no selection yet
    if (!selectedConversation && Object.values(conversations).length > 0 && !loading.conversations) {
      setSelectedConversation(Object.values(conversations)[0]);
    }
  }, [conversations, selectedConversation, setSelectedConversation, loading.conversations]);

  // Store the last loaded conversation ID to prevent reload loops
  const [lastLoadedConversationId, setLastLoadedConversationId] = useState<string | null>(null);
  // Track the timestamp of the last message load to implement throttling
  const [lastLoadTimestamp, setLastLoadTimestamp] = useState<number>(0);
  // Use a ref to track the latest effect ID to prevent race conditions
  const latestEffectIdRef = React.useRef<number>(0);

  // Load messages when selected conversation changes - Enhanced stability
  useEffect(() => {
    // If no conversation selected, clear messages and exit
    if (!selectedConversation) {
      setConversationMessages([]);
      return;
    }

    // Skip reload if it's the same conversation we just loaded and we have messages
    // This prevents infinite loops and unnecessary reloads
    if (lastLoadedConversationId === selectedConversation.id && conversationMessages.length > 0) {
      return;
    }

    // Implement time-based throttling (don't load more than once every 500ms)
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimestamp;
    if (timeSinceLastLoad < 500 && lastLoadedConversationId === selectedConversation.id) {
      console.log(`ConversationsView: Throttling message load, last load was ${timeSinceLastLoad}ms ago`);
      return;
    }

    // Generate a unique ID for this effect instance
    const effectId = Date.now();
    latestEffectIdRef.current = effectId;

    // Store if this effect is still active or has been cleaned up
    let isActive = true;

    // Improved message loading function with enhanced state management
    const loadMessages = async () => {
      // Double-check if the conversation is still selected (it might have changed during async operations)
      if (!selectedConversation || !isActive) {
        return;
      }

      // Reference the ID to avoid closure issues
      const conversationId = selectedConversation.id;

      try {
        if (isActive && latestEffectIdRef.current === effectId) {
          setLoadingMessages(true);
          setMessageError(null);
          setLastLoadTimestamp(now);
        }

        console.log(`ConversationsView: Loading messages for conversation ${conversationId}, effect #${effectId}`);

        // Only continue if this effect is still the most recent
        if (!isActive || latestEffectIdRef.current !== effectId) {
          console.log(`ConversationsView: Effect #${effectId} no longer active or not latest, aborting message load`);
          return;
        }

        // Get messages using the improved function in DataContext
        const messages = await getMessagesByConversationId(conversationId);

        // Only update state if this effect is still active, latest, and conversation hasn't changed
        if (isActive && latestEffectIdRef.current === effectId &&
            selectedConversation && selectedConversation.id === conversationId) {
          setConversationMessages(messages);
          setLoadingMessages(false);
          // Remember that we've loaded this conversation
          setLastLoadedConversationId(conversationId);
          console.log(`ConversationsView: Loaded ${messages.length} messages for conversation ${conversationId}`);
        }
      } catch (error) {
        console.error(`Error loading messages for effect #${effectId}:`, error);

        // Only update error state if this effect is still active and latest
        if (isActive && latestEffectIdRef.current === effectId &&
            selectedConversation && selectedConversation.id === conversationId) {
          setMessageError('Failed to load messages');
          setConversationMessages([]);
          setLoadingMessages(false);
        }
      }
    };

    // Delay message loading slightly to debounce rapid navigation
    const timeoutId = setTimeout(() => {
      // Only load if this is still the latest effect
      if (latestEffectIdRef.current === effectId) {
        loadMessages();
      }
    }, 50);

    // Cleanup function to prevent state updates after component unmount or effect change
    return () => {
      console.log(`ConversationsView: Cleaning up message loading effect #${effectId}`);
      clearTimeout(timeoutId);
      isActive = false;
    };
  }, [selectedConversation, getMessagesByConversationId, lastLoadedConversationId, conversationMessages.length]);

  // Memoize the entire UI to prevent unnecessary re-renders
  const uiContent = useMemo(() => {
    return (
      <div className="flex flex-1 h-screen">
        <div className="w-96 border-r overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        </div>

        {selectedConversation ? (
          <div className="flex-1 bg-gray-50 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
            <ConversationDetail
              conversation={selectedConversation}
              messages={conversationMessages}
              loading={loadingMessages}
              error={messageError}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50" style={{ height: 'calc(100vh - 64px)' }}>
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation to view messages and AI analysis</p>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    conversations,
    selectedConversation,
    conversationMessages,
    loadingMessages,
    messageError,
    setSelectedConversation
  ]);

  return uiContent;
};

export default ConversationsView;
