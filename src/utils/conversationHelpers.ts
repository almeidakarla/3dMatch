import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Conversation Helpers
 *
 * Key difference from the CRA version:
 * Instead of importing a global `supabase` instance, these functions
 * receive the client as a parameter. This allows them to work with
 * either the browser client or the server client depending on context.
 */

interface ConversationResult {
  success: boolean
  conversationId?: string
  error?: string
}

interface Conversation {
  participant1_id: string
  participant2_id: string
  [key: string]: unknown
}

/**
 * Gets an existing conversation or creates a new one between two users
 * Uses the database function to ensure proper participant ordering and prevent duplicates
 */
export const getOrCreateConversation = async (
  supabase: SupabaseClient,
  userId1: string,
  userId2: string,
  projectId: string | null = null
): Promise<ConversationResult> => {
  try {
    if (!userId1 || !userId2) {
      return { success: false, error: 'User IDs are required' }
    }

    if (userId1 === userId2) {
      return { success: false, error: 'Cannot create conversation with yourself' }
    }

    const { data, error } = await supabase
      .rpc('get_or_create_conversation', {
        p_user1_id: userId1,
        p_user2_id: userId2,
        p_project_id: projectId,
      })

    if (error) {
      console.error('Error in getOrCreateConversation:', error)
      return { success: false, error: 'Error creating conversation' }
    }

    return { success: true, conversationId: data }
  } catch (error) {
    console.error('Unexpected error in getOrCreateConversation:', error)
    return { success: false, error: 'Unexpected error creating conversation' }
  }
}

/**
 * Get the receiver ID from a conversation (the other participant)
 */
export const getReceiverId = (
  conversation: Conversation | null,
  currentUserId: string
): string | null => {
  if (!conversation) return null
  return conversation.participant1_id === currentUserId
    ? conversation.participant2_id
    : conversation.participant1_id
}
