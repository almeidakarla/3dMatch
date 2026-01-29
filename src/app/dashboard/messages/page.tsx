'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import {
  MessageCircle, Send, Search, X, MoreVertical, Plus,
  Paperclip, Check, CheckCheck, ArrowLeft
} from 'lucide-react'
import { getOrCreateConversation, getReceiverId } from '@/utils/conversationHelpers'
import MediaUpload from '@/components/messages/MediaUpload'
import MediaMessage from '@/components/messages/MediaMessage'
import { formatPrivateName } from '@/utils/nameFormatter'
import { getTypingWarning, sanitizeContent } from '@/utils/contentFilter'

function MessagesContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [sending, setSending] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [contentWarning, setContentWarning] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  useEffect(() => { scrollToBottom() }, [messages])

  const loadConversations = useCallback(async () => {
    if (!user) return
    try {
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`*, participant1:profiles!conversations_participant1_id_fkey ( id, full_name, profile_photo, user_type ), participant2:profiles!conversations_participant2_id_fkey ( id, full_name, profile_photo, user_type ), project:projects ( id, title )`)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
      if (conversationsError) throw conversationsError

      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conversation: any) => {
          const { data: lastMsg } = await supabase.from('messages').select('content, sender_id, created_at, media_type')
            .eq('conversation_id', conversation.id).order('created_at', { ascending: false }).limit(1).single()
          const { count: unreadCount } = await supabase.from('messages').select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id).eq('is_read', false).neq('sender_id', user.id)
          let previewText = 'No messages'
          if (lastMsg) {
            if (lastMsg.media_type === 'image') previewText = 'Image'
            else if (lastMsg.media_type === 'video') previewText = 'Video'
            else if (lastMsg.content) previewText = lastMsg.content
          }
          return { ...conversation, last_message_content: previewText, last_message_sender: lastMsg?.sender_id || null, last_message_time: lastMsg?.created_at || conversation.created_at, unread_count: unreadCount || 0 }
        })
      )
      setConversations(enrichedConversations)
    } catch (err) { console.error('Error loading conversations:', err); setError('Error loading conversations') }
    finally { setLoading(false) }
  }, [user, supabase])

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error: msgError } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true })
      if (msgError) throw msgError
      setMessages(data || [])
    } catch (err) { console.error('Error loading messages:', err) }
  }, [supabase])

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    try {
      await supabase.from('messages').update({ is_read: true }).eq('conversation_id', conversationId).eq('is_read', false).neq('sender_id', user!.id)
      await loadConversations()
    } catch (err) { console.error('Error marking as read:', err) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleSelectConversation = useCallback((conversation: any) => {
    setSelectedConversation(conversation)
    loadMessages(conversation.id)
    markMessagesAsRead(conversation.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBackToConversations = () => { setSelectedConversation(null); setMessages([]) }

  const handleSendMessage = async (e?: React.FormEvent | null, mediaData: any = null) => {
    e?.preventDefault()
    if (mediaData) {
      if (!selectedConversation || !user || sending) return
      setSending(true)
      try {
        const receiverId = getReceiverId(selectedConversation, user.id)
        const { data: newMessage, error: msgError } = await supabase.from('messages').insert({ conversation_id: selectedConversation.id, sender_id: user.id, receiver_id: receiverId, content: mediaData.caption, media_url: mediaData.mediaUrl, media_type: mediaData.mediaType, is_read: false }).select().single()
        if (msgError) throw msgError
        await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', selectedConversation.id)
        setMessages(prev => [...prev, newMessage])
        await loadConversations()
      } catch (err) { console.error('Error sending media:', err); setError('Error sending media'); setTimeout(() => setError(''), 3000) }
      finally { setSending(false) }
      return
    }
    if (!selectedConversation || !user || !messageInput.trim() || sending) return
    const messageContent = messageInput.trim()
    const sanitizedContent = sanitizeContent(messageContent)
    if (sanitizedContent !== messageContent) { setContentWarning('Contact information was automatically removed from your message'); setTimeout(() => setContentWarning(''), 5000) }
    setSending(true); setMessageInput(''); setContentWarning('')
    try {
      const receiverId = getReceiverId(selectedConversation, user.id)
      const { data: newMessage, error: msgError } = await supabase.from('messages').insert({ conversation_id: selectedConversation.id, sender_id: user.id, receiver_id: receiverId, content: sanitizedContent, is_read: false }).select().single()
      if (msgError) throw msgError
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', selectedConversation.id)
      setMessages(prev => [...prev, newMessage])
      await loadConversations()
    } catch (err) { console.error('Error sending message:', err); setError('Error sending message'); setMessageInput(messageContent); setTimeout(() => setError(''), 3000) }
    finally { setSending(false) }
  }

  const handleMediaSelected = async (mediaData: any) => { await handleSendMessage(null, mediaData) }

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value; setMessageInput(value)
    const warning = getTypingWarning(value); setContentWarning(warning || '')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any) }
  }

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp); const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffInSeconds < 60) return 'Now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) { const days = Math.floor(diffInSeconds / 86400); return days === 1 ? 'Yesterday' : `${days}d` }
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })
  }

  const getOtherParticipant = (conversation: any) => {
    if (!conversation) return null
    return conversation.participant1_id === user?.id ? conversation.participant2 : conversation.participant1
  }

  const loadAvailableUsers = async () => {
    try {
      const { data: users, error: usersError } = await supabase.from('profiles').select('id, full_name, profile_photo, user_type').neq('id', user!.id).order('full_name', { ascending: true })
      if (usersError) throw usersError
      const existingUserIds = new Set<string>()
      conversations.forEach((conv: any) => { if (conv.participant1_id !== user!.id) existingUserIds.add(conv.participant1_id); if (conv.participant2_id !== user!.id) existingUserIds.add(conv.participant2_id) })
      setAvailableUsers((users || []).filter((u: any) => !existingUserIds.has(u.id)))
    } catch (err) { console.error('Error loading users:', err) }
  }

  const handleNewConversation = async (otherUserId: string) => {
    try {
      const result = await getOrCreateConversation(supabase, user!.id, otherUserId, null)
      if (result.success && result.conversationId) {
        await loadConversations()
        setTimeout(() => { const newConv = conversations.find((c: any) => c.id === result.conversationId); if (newConv) handleSelectConversation(newConv) }, 500)
        setShowNewConversationModal(false)
      }
    } catch (err) { console.error('Error creating conversation:', err) }
  }

  useEffect(() => {
    if (!user) return
    loadConversations()
    const messagesSubscription = supabase.channel('messages-channel').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const newMessage = payload.new as any
      if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
        setMessages(prev => { if (prev.some((msg: any) => msg.id === newMessage.id)) return prev; return [...prev, newMessage] })
        if (newMessage.sender_id !== user.id) markMessagesAsRead(selectedConversation.id)
      }
      loadConversations()
    }).subscribe()
    return () => { messagesSubscription.unsubscribe() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedConversation])

  useEffect(() => {
    const conversationId = searchParams.get('conversationId')
    if (conversationId && conversations.length > 0) {
      const targetConv = conversations.find((c: any) => c.id === conversationId)
      if (targetConv) handleSelectConversation(targetConv)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, searchParams])

  const filteredConversations = conversations.filter((conv: any) => {
    const otherUser = getOtherParticipant(conv)
    return formatPrivateName(otherUser?.full_name).toLowerCase().includes(searchTerm.toLowerCase())
  })

  const filteredUsers = availableUsers.filter((u: any) => formatPrivateName(u.full_name).toLowerCase().includes(userSearchTerm.toLowerCase()))

  if (loading) return <div className="messages-loading"><div className="logo-icon">3D</div><p>Loading messages...</p></div>

  const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null

  return (
    <div className="modern-messages-container">
      {error && <div className="modern-message-error">{error}</div>}
      <div className="modern-messages-layout">
        <div className={`modern-messages-sidebar ${isMobile && selectedConversation ? 'hidden' : ''}`}>
          <div className="modern-sidebar-header">
            <h2>Messages</h2>
            <button className="modern-new-chat-btn" onClick={() => { setShowNewConversationModal(true); loadAvailableUsers() }} title="New conversation"><Plus size={20} /></button>
          </div>
          <div className="modern-search-container">
            <Search size={18} />
            <input type="text" placeholder="Search conversations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="modern-search-input" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="modern-search-clear"><X size={16} /></button>}
          </div>
          <div className="modern-conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="modern-empty-conversations">
                <MessageCircle size={48} /><p>No conversations yet</p>
                <button className="btn-primary btn-sm" onClick={() => { setShowNewConversationModal(true); loadAvailableUsers() }}>Start conversation</button>
              </div>
            ) : (
              filteredConversations.map((conversation: any) => {
                const otherUser = getOtherParticipant(conversation)
                const isSelected = selectedConversation?.id === conversation.id
                return (
                  <div key={conversation.id} className={`modern-conversation-item ${isSelected ? 'selected' : ''}`} onClick={() => handleSelectConversation(conversation)}>
                    <div className="modern-conversation-avatar">
                      {otherUser?.profile_photo ? <img src={otherUser.profile_photo} alt={formatPrivateName(otherUser.full_name)} /> : <div className="modern-avatar-placeholder">{formatPrivateName(otherUser?.full_name)?.charAt(0).toUpperCase()}</div>}
                    </div>
                    <div className="modern-conversation-content">
                      <div className="modern-conversation-header">
                        <span className="modern-conversation-name">{formatPrivateName(otherUser?.full_name)}</span>
                        <span className="modern-conversation-time">{formatMessageTime(conversation.last_message_time)}</span>
                      </div>
                      <div className="modern-conversation-footer">
                        <p className="modern-conversation-preview">
                          {conversation.last_message_sender === user?.id && <Check size={14} className="modern-sent-indicator" />}
                          {conversation.last_message_content}
                        </p>
                        {conversation.unread_count > 0 && <span className="modern-unread-badge">{conversation.unread_count}</span>}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="modern-chat-area">
          {selectedConversation ? (
            <>
              <div className="modern-chat-header">
                <div className="modern-chat-user-info">
                  {isMobile && <button className="modern-chat-header-mobile-back" onClick={handleBackToConversations} title="Back"><ArrowLeft size={24} /></button>}
                  <div className="modern-chat-avatar">
                    {otherParticipant?.profile_photo ? <img src={otherParticipant.profile_photo} alt={formatPrivateName(otherParticipant.full_name)} /> : <div className="modern-avatar-placeholder">{formatPrivateName(otherParticipant?.full_name)?.charAt(0).toUpperCase()}</div>}
                  </div>
                  <div className="modern-chat-user-details">
                    <h3>{formatPrivateName(otherParticipant?.full_name)}</h3>
                    <span className="modern-user-type">{otherParticipant?.user_type === 'artista' ? '3D Artist' : 'Designer & Developer'}</span>
                  </div>
                </div>
                <div className="modern-chat-actions"><button className="modern-chat-action-btn" title="More options"><MoreVertical size={20} /></button></div>
              </div>

              <div className="modern-messages-area">
                {messages.map((message: any, index: number) => {
                  const isOwn = message.sender_id === user?.id
                  const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id
                  const showTime = index === messages.length - 1 || messages[index + 1]?.sender_id !== message.sender_id
                  return (
                    <div key={message.id} className={`modern-message-wrapper ${isOwn ? 'own' : 'other'}`}>
                      {!isOwn && showAvatar && (
                        <div className="modern-message-avatar">
                          {otherParticipant?.profile_photo ? <img src={otherParticipant.profile_photo} alt="" /> : <div className="modern-avatar-placeholder-small">{formatPrivateName(otherParticipant?.full_name)?.charAt(0).toUpperCase()}</div>}
                        </div>
                      )}
                      {!isOwn && !showAvatar && <div className="modern-message-avatar-spacer" />}
                      {message.media_url ? <MediaMessage message={message} isOwn={isOwn} /> : (
                        <div className="modern-message-bubble">
                          <div className="modern-message-content">{message.content}</div>
                          {showTime && (
                            <div className="modern-message-meta">
                              <span className="modern-message-time">{new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              {isOwn && <span className="modern-message-status">{message.is_read ? <CheckCheck size={16} className="read" /> : <Check size={16} className="sent" />}</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="modern-input-area">
                {contentWarning && <div style={{ padding: '8px 12px', background: '#fff3cd', color: '#856404', fontSize: '0.875rem', borderRadius: '8px', margin: '8px 0', border: '1px solid #ffc107' }}>{contentWarning}</div>}
                <form onSubmit={(e) => handleSendMessage(e)} className="modern-input-form">
                  <button type="button" className="modern-input-action" title="Attach media" onClick={() => setShowMediaUpload(true)} disabled={!selectedConversation}><Paperclip size={20} /></button>
                  <textarea ref={textareaRef} value={messageInput} onChange={handleMessageInputChange} onKeyDown={handleKeyDown} placeholder="Type a message..." className="modern-message-input" rows={1} disabled={sending} />
                  <button type="submit" className="modern-send-button" disabled={!messageInput.trim() || sending || !!contentWarning} title="Send"><Send size={20} /></button>
                </form>
              </div>
            </>
          ) : (
            <div className="modern-empty-chat"><MessageCircle size={64} /><h3>Select a conversation</h3><p>Choose a conversation from the sidebar or start a new one</p></div>
          )}
        </div>
      </div>

      {showNewConversationModal && (
        <div className="modal-overlay" onClick={() => setShowNewConversationModal(false)}>
          <div className="modal-content modern-new-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>New Conversation</h3><button onClick={() => setShowNewConversationModal(false)} className="modal-close"><X size={24} /></button></div>
            <div className="modern-modal-search"><Search size={18} /><input type="text" placeholder="Search users..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} /></div>
            <div className="modern-users-list">
              {filteredUsers.length === 0 ? <div className="modern-empty-users"><p>No users available</p></div> : (
                filteredUsers.map((otherUser: any) => (
                  <div key={otherUser.id} className="modern-user-item" onClick={() => handleNewConversation(otherUser.id)}>
                    <div className="modern-user-avatar">
                      {otherUser.profile_photo ? <img src={otherUser.profile_photo} alt={formatPrivateName(otherUser.full_name)} /> : <div className="modern-avatar-placeholder">{formatPrivateName(otherUser.full_name).charAt(0).toUpperCase()}</div>}
                    </div>
                    <div className="modern-user-info">
                      <div className="modern-user-name">{formatPrivateName(otherUser.full_name)}</div>
                      <div className="modern-user-type">{otherUser.user_type === 'artista' ? '3D Artist' : 'Designer & Developer'}</div>
                    </div>
                    <MessageCircle size={18} className="modern-user-icon" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showMediaUpload && <MediaUpload onMediaSelected={handleMediaSelected} onClose={() => setShowMediaUpload(false)} />}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="messages-loading"><div className="logo-icon">3D</div><p>Loading messages...</p></div>}>
      <MessagesContent />
    </Suspense>
  )
}
