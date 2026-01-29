'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Send, Check, CheckCheck, Paperclip } from 'lucide-react'
import { getOrCreateConversation } from '@/utils/conversationHelpers'
import MediaUpload from '@/components/messages/MediaUpload'
import MediaMessage from '@/components/messages/MediaMessage'
import { getTypingWarning, sanitizeContent } from '@/utils/contentFilter'

interface MessagesProps {
  conversationId?: string
  otherUserId: string
  projectId?: string
}

export default function Messages({ otherUserId, projectId }: MessagesProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [contentWarning, setContentWarning] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  useEffect(() => { scrollToBottom() }, [messages])

  const initConversation = useCallback(async () => {
    if (!user || !otherUserId) return
    try {
      setLoading(true)
      const result = await getOrCreateConversation(supabase, user.id, otherUserId, projectId || null)
      if (result.success && result.conversationId) {
        const { data: convData } = await supabase.from('conversations').select('*').eq('id', result.conversationId).single()
        setConversation(convData)
        const { data: messagesData } = await supabase.from('messages').select('*').eq('conversation_id', result.conversationId).order('created_at', { ascending: true })
        setMessages(messagesData || [])
        await supabase.from('messages').update({ is_read: true }).eq('conversation_id', result.conversationId).eq('is_read', false).neq('sender_id', user.id)
      }
    } catch (err) { console.error('Error initializing conversation:', err) }
    finally { setLoading(false) }
  }, [user, otherUserId, projectId, supabase])

  useEffect(() => { initConversation() }, [initConversation])

  useEffect(() => {
    if (!conversation || !user) return
    const subscription = supabase.channel(`messages-${conversation.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversation.id}` }, (payload) => {
      const newMessage = payload.new as any
      setMessages(prev => { if (prev.some(msg => msg.id === newMessage.id)) return prev; return [...prev, newMessage] })
      if (newMessage.sender_id !== user.id) {
        supabase.from('messages').update({ is_read: true }).eq('id', newMessage.id)
      }
    }).subscribe()
    return () => { subscription.unsubscribe() }
  }, [conversation, user, supabase])

  const handleSendMessage = async (e?: React.FormEvent | null, mediaData: any = null) => {
    e?.preventDefault()
    if (!conversation || !user || sending) return

    if (mediaData) {
      setSending(true)
      try {
        const { data: newMessage, error } = await supabase.from('messages').insert({ conversation_id: conversation.id, sender_id: user.id, receiver_id: otherUserId, content: mediaData.caption, media_url: mediaData.mediaUrl, media_type: mediaData.mediaType, is_read: false }).select().single()
        if (error) throw error
        await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversation.id)
        setMessages(prev => [...prev, newMessage])
      } catch (err) { console.error('Error sending media:', err) }
      finally { setSending(false) }
      return
    }

    if (!messageInput.trim()) return
    const messageContent = messageInput.trim()
    const sanitizedContent = sanitizeContent(messageContent)
    if (sanitizedContent !== messageContent) { setContentWarning('Contact information was automatically removed'); setTimeout(() => setContentWarning(''), 5000) }

    setSending(true); setMessageInput(''); setContentWarning('')
    try {
      const { data: newMessage, error } = await supabase.from('messages').insert({ conversation_id: conversation.id, sender_id: user.id, receiver_id: otherUserId, content: sanitizedContent, is_read: false }).select().single()
      if (error) throw error
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversation.id)
      setMessages(prev => [...prev, newMessage])
    } catch (err) { console.error('Error sending message:', err); setMessageInput(messageContent) }
    finally { setSending(false) }
  }

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value; setMessageInput(value)
    const warning = getTypingWarning(value); setContentWarning(warning || '')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any) }
  }

  if (loading) return <div className="embedded-messages-loading">Loading messages...</div>

  return (
    <div className="embedded-messages-container">
      <div className="embedded-messages-area">
        {messages.length === 0 ? (
          <div className="embedded-messages-empty"><p>No messages yet. Start the conversation!</p></div>
        ) : (
          messages.map((message: any) => {
            const isOwn = message.sender_id === user?.id
            return (
              <div key={message.id} className={`embedded-message-wrapper ${isOwn ? 'own' : 'other'}`}>
                {message.media_url ? <MediaMessage message={message} isOwn={isOwn} /> : (
                  <div className="embedded-message-bubble">
                    <div className="embedded-message-content">{message.content}</div>
                    <div className="embedded-message-meta">
                      <span className="embedded-message-time">{new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isOwn && <span className="embedded-message-status">{message.is_read ? <CheckCheck size={14} className="read" /> : <Check size={14} className="sent" />}</span>}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="embedded-input-area">
        {contentWarning && <div className="embedded-content-warning">{contentWarning}</div>}
        <form onSubmit={(e) => handleSendMessage(e)} className="embedded-input-form">
          <button type="button" className="embedded-input-action" title="Attach media" onClick={() => setShowMediaUpload(true)}><Paperclip size={18} /></button>
          <textarea value={messageInput} onChange={handleMessageInputChange} onKeyDown={handleKeyDown} placeholder="Type a message..." className="embedded-message-input" rows={1} disabled={sending} />
          <button type="submit" className="embedded-send-button" disabled={!messageInput.trim() || sending || !!contentWarning} title="Send"><Send size={18} /></button>
        </form>
      </div>

      {showMediaUpload && <MediaUpload onMediaSelected={(data) => { handleSendMessage(null, data); setShowMediaUpload(false) }} onClose={() => setShowMediaUpload(false)} />}
    </div>
  )
}
