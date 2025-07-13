import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './useConversations';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'audio';
  file_url?: string;
  reply_to?: string;
  created_at: string;
  sender: Profile;
}

export function useMessages(conversationId?: string, currentUserId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get all profiles for message senders
      const senderIds = messagesData?.map(msg => msg.sender_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', senderIds);

      const formattedMessages: Message[] = messagesData?.map(msg => {
        const senderProfile = profiles?.find(p => p.user_id === msg.sender_id);
        return {
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          content: msg.content,
          message_type: msg.message_type as 'text' | 'image' | 'file' | 'audio',
          file_url: msg.file_url,
          reply_to: msg.reply_to,
          created_at: msg.created_at,
          sender: senderProfile || { id: '', user_id: msg.sender_id, display_name: 'Unknown', is_online: false }
        };
      }) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' | 'file' | 'audio' = 'text') => {
    if (!conversationId || !currentUserId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: content.trim(),
          message_type: messageType
        });

      if (error) throw error;

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch the complete message with sender profile
          const { data: messageData } = await supabase
            .from('messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (messageData) {
            // Get sender profile
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', messageData.sender_id)
              .single();

            const newMessage: Message = {
              id: messageData.id,
              conversation_id: messageData.conversation_id,
              sender_id: messageData.sender_id,
              content: messageData.content,
              message_type: messageData.message_type as 'text' | 'image' | 'file' | 'audio',
              file_url: messageData.file_url,
              reply_to: messageData.reply_to,
              created_at: messageData.created_at,
              sender: senderProfile || { id: '', user_id: messageData.sender_id, display_name: 'Unknown', is_online: false }
            };

            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
}