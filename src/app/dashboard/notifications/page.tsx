'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import {
  Bell,
  Briefcase,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  FileText,
  Star,
  Trash2,
  CheckCheck
} from 'lucide-react'

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  const loadNotifications = useCallback(async () => {
    if (!user) return

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter === 'unread') {
        query = query.eq('is_read', false)
      } else if (filter === 'read') {
        query = query.eq('is_read', true)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setNotifications(data || [])
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('Error loading notifications')
    } finally {
      setLoading(false)
    }
  }, [user, filter, supabase])

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id)

      if (unreadIds.length === 0) return

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      )
    } catch (err) {
      console.error('Error marking all as read:', err)
      setError('Error marking all as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (deleteError) throw deleteError

      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      )
    } catch (err) {
      console.error('Error deleting notification:', err)
      setError('Error deleting notification')
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    if (notification.link) {
      router.push(notification.link)
    }
  }

  useEffect(() => {
    if (!user) return

    loadNotifications()

    const notificationsSubscription = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications(prev =>
            prev.map(notif =>
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id
          setNotifications(prev =>
            prev.filter(notif => notif.id !== deletedId)
          )
        }
      )
      .subscribe()

    return () => {
      notificationsSubscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadNotifications])

  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 20 }

    switch (type) {
      case 'new_application':
        return <FileText {...iconProps} />
      case 'project_invite':
        return <Briefcase {...iconProps} className="text-primary" />
      case 'application_accepted':
        return <CheckCircle {...iconProps} className="text-success" />
      case 'application_rejected':
        return <XCircle {...iconProps} className="text-error" />
      case 'new_message':
        return <MessageSquare {...iconProps} />
      case 'payment_received':
        return <DollarSign {...iconProps} className="text-success" />
      case 'project_delivered':
        return <CheckCircle {...iconProps} className="text-success" />
      case 'review_received':
        return <Star {...iconProps} className="text-warning" />
      case 'quote_request':
      case 'quote_response':
        return <FileText {...iconProps} />
      default:
        return <Bell {...iconProps} />
    }
  }

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Now'
    if (diffMins < 60) return `${diffMins}min ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo-icon">3D</div>
        <p>Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div>
          <h2>
            <Bell size={24} />
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="unread-count-badge">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-text"
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="message-error">{error}</div>
      )}

      <div className="notification-filters">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="notifications-empty">
          <Bell size={64} />
          <h3>No notifications</h3>
          <p>
            {filter === 'all'
              ? 'You have no notifications yet'
              : filter === 'unread'
              ? 'All notifications have been read'
              : 'No read notifications'}
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.is_read ? 'unread' : ''} ${
                notification.link ? 'clickable' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-header">
                  <h4 className="notification-title">{notification.title}</h4>
                  <span className="notification-time">
                    {formatTime(notification.created_at)}
                  </span>
                </div>
                <p className="notification-message">{notification.message}</p>
                {!notification.is_read && (
                  <span className="unread-dot"></span>
                )}
              </div>

              <button
                className="notification-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNotification(notification.id)
                }}
                title="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
