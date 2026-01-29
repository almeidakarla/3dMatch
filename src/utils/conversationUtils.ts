import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Conversation Utilities
 *
 * Same pattern as conversationHelpers — receives supabase client as parameter
 * instead of importing a global singleton.
 */

interface ConversationData {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_at: string
  [key: string]: unknown
}

interface GetOrCreateResult {
  conversation: ConversationData
  isNew: boolean
}

interface StartConversationResult {
  conversation: ConversationData
  message: Record<string, unknown>
}

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (
  supabase: SupabaseClient,
  currentUserId: string,
  otherUserId: string
): Promise<GetOrCreateResult> => {
  const { data: existingConversations, error: searchError } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`
    )
    .limit(1)

  if (searchError) throw searchError

  if (existingConversations && existingConversations.length > 0) {
    return { conversation: existingConversations[0], isNew: false }
  }

  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert({
      participant1_id: currentUserId,
      participant2_id: otherUserId,
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (createError) throw createError

  return { conversation: newConversation, isNew: true }
}

/**
 * Send an initial message to start a conversation
 */
export const startConversation = async (
  supabase: SupabaseClient,
  currentUserId: string,
  otherUserId: string,
  message: string
): Promise<StartConversationResult> => {
  const { conversation } = await getOrCreateConversation(supabase, currentUserId, otherUserId)

  const { data: newMessage, error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content: message,
      is_read: false,
    })
    .select()
    .single()

  if (messageError) throw messageError

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversation.id)

  return { conversation, message: newMessage }
}
