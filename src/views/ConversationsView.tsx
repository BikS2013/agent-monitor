import React, { useState, useEffect, useMemo } from 'react';
import { MessageCircle, Database, Cloud } from 'lucide-react';
import ConversationsList from '../components/ConversationsList';
import ConversationDetail from '../components/ConversationDetail';
import { useConversationsData } from '../context/ConversationsDataContext';
import { useConversationsRepositories } from '../context/ConversationsRepositoryContext';
import { Conversation, Message } from '../data/types';

interface ConversationsViewProps {
  selectedConversation?: Conversation | null;
  setSelectedConversation?: (conversation: Conversation | null) => void;
}

const ConversationsView: React.FC<ConversationsViewProps> = ({
  selectedConversation: propSelectedConversation,
  setSelectedConversation: propSetSelectedConversation
}) => {
  const { conversations, getMessagesByConversationId, loading } = useConversationsData();
  const { isUsingApi } = useConversationsRepositories();
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

  // Store the last loaded conversation thread_id to prevent reload loops
  const [lastLoadedThreadId, setLastLoadedThreadId] = useState<string | null>(null);
  // Track the timestamp of the last message load to implement throttling
  const [lastLoadTimestamp, setLastLoadTimestamp] = useState<number>(0);
  // Use a ref to track the latest effect ID to prevent race conditions
  const latestEffectIdRef = React.useRef<number>(0);

  // Load messages when selected conversation changes - Fixed with useRef to prevent loops
  const effectRunningRef = React.useRef<boolean>(false);
  const prevThreadIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Skip if either:
    // 1. No conversation is selected
    // 2. We already loaded this conversation and have messages
    // 3. An effect for this conversation is already running
    if (!selectedConversation) {
      setConversationMessages([]);
      return;
    }

    const thread_id = selectedConversation.thread_id;

    // Avoid infinite loops with these checks
    if (effectRunningRef.current) {
      console.log(`ConversationsView: Skipping duplicate effect as one is already running`);
      return;
    }

    if (lastLoadedThreadId === thread_id &&
        conversationMessages.length > 0 &&
        prevThreadIdRef.current === thread_id) {
      console.log(`ConversationsView: Skipping load for conversation ${thread_id} - already loaded`);
      return;
    }

    // Mark as running to prevent concurrent execution
    effectRunningRef.current = true;

    // Store current conversation thread_id
    prevThreadIdRef.current = thread_id;

    // Generate a unique ID for this effect instance
    const effectId = Date.now();
    latestEffectIdRef.current = effectId;

    // Create a flag to track if this effect is still active
    let isActive = true;

    console.log(`ConversationsView: Starting load (effectId=${effectId}) for conversation ${thread_id}`);

    const loadMessages = async () => {
      try {
        if (!isActive) return;

        // Set loading state
        setLoadingMessages(true);
        setMessageError(null);
        setLastLoadTimestamp(Date.now());

        console.log(`ConversationsView: Loading messages for conversation ${thread_id}, effect #${effectId}`);

        // Get messages
        const messages = await getMessagesByConversationId(thread_id);

        // Only update state if this effect is still active and conversation hasn't changed
        if (isActive) {
          if (prevThreadIdRef.current === thread_id) {
            setConversationMessages(messages);
            setLoadingMessages(false);
            setLastLoadedThreadId(thread_id);
            console.log(`ConversationsView: Loaded ${messages.length} messages for conversation ${thread_id}`);
          } else {
            console.log(`ConversationsView: Conversation changed during load, discarding results`);
          }
        }
      } catch (error) {
        console.error(`Error loading messages for conversation ${thread_id} (effect #${effectId}):`, error);

        if (isActive) {
          setMessageError('Failed to load messages');
          setConversationMessages([]);
          setLoadingMessages(false);
        }
      } finally {
        // Always mark as no longer running
        if (isActive) {
          console.log(`ConversationsView: Completed message loading effect #${effectId}`);
          effectRunningRef.current = false;
        }
      }
    };

    // Execute the load operation directly
    loadMessages();

    // Cleanup function
    return () => {
      console.log(`ConversationsView: Cleaning up message loading effect #${effectId}`);
      isActive = false;
      effectRunningRef.current = false;
    };
  }, [selectedConversation?.thread_id]); // Only depend on the conversation ID

  // Data source indicator has been moved to ConversationDetail component

  // Memoize the entire UI to prevent unnecessary re-renders
  const uiContent = useMemo(() => {
    return (
      <div className="flex flex-1 relative" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Left sidebar with fixed header (A2) and scrollable content (B1) */}
        <div className="w-96 border-r flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
          {/* A2 area is handled inside ConversationsList component */}
          <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        </div>

        {/* Main content area with fixed header (A3) and scrollable content (B2) */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
            {/* A3 area is handled inside ConversationDetail component */}
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
    setSelectedConversation,
    isUsingApi
  ]);

  return uiContent;
};

export default ConversationsView;
