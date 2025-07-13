import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  phone_number?: string;
  bio?: string;
  last_seen?: string;
  is_online: boolean;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  participants: Profile[];
  last_message?: {
    content: string;
    created_at: string;
    sender: Profile;
  };
  unread_count: number;
}

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!userId) return;

    try {
      // Get conversations with participants and last message
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants (
            user_id,
            profiles (*)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get last messages for each conversation
      const conversationIds = conversationsData?.map(conv => conv.id) || [];
      let lastMessages: any[] = [];
      let profiles: any[] = [];
      
      if (conversationIds.length > 0) {
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });

        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*');

        lastMessages = messagesData || [];
        profiles = profilesData || [];
      }

      const formattedConversations: Conversation[] = conversationsData?.map(conv => {
        const participants = conv.conversation_participants?.map((p: any) => p.profiles).filter(Boolean) || [];
        const conversationMessages = lastMessages?.filter(msg => msg.conversation_id === conv.id) || [];
        const lastMessage = conversationMessages.length > 0 ? conversationMessages[0] : null;
        
        // For direct chats, use the other person's name as conversation name
        let conversationName = conv.name;
        if (conv.type === 'direct' && participants.length === 2) {
          const otherUser = participants.find((p: Profile) => p.user_id !== userId);
          conversationName = otherUser?.display_name || 'Unknown User';
        }

        const senderProfile = lastMessage ? profiles.find(p => p.user_id === lastMessage.sender_id) : null;

        return {
          id: conv.id,
          type: conv.type as 'direct' | 'group',
          name: conversationName,
          avatar_url: conv.avatar_url,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          participants,
          last_message: lastMessage ? {
            content: lastMessage.content,
            created_at: lastMessage.created_at,
            sender: senderProfile || { id: '', user_id: lastMessage.sender_id, display_name: 'Unknown', is_online: false }
          } : undefined,
          unread_count: 0 // TODO: Implement unread count logic
        };
      }) || [];

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDirectConversation = async (otherUserId: string) => {
    if (!userId) return null;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversation_participants')
        .select('conversation_id, conversations(*)')
        .eq('user_id', userId);

      if (existingConv) {
        for (const participant of existingConv) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', participant.conversation_id)
            .eq('user_id', otherUserId)
            .single();

          if (otherParticipant) {
            return participant.conversation_id;
          }
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          created_by: userId
        })
        .select('*')
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: userId },
          { conversation_id: conversation.id, user_id: otherUserId }
        ]);

      if (participantError) throw participantError;

      fetchConversations();
      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  return {
    conversations,
    loading,
    refetch: fetchConversations,
    createDirectConversation
  };
}