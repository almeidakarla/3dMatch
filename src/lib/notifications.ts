import { SupabaseClient } from '@supabase/supabase-js'

export type NotificationType =
  | 'application_accepted'
  | 'application_rejected'
  | 'project_invite'
  | 'project_delivered'
  | 'revision_requested'
  | 'new_message'
  | 'payment_received'

interface CreateNotificationParams {
  supabase: SupabaseClient
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

interface SendEmailParams {
  to: string
  type: NotificationType
  title: string
  message: string
  link?: string
  recipientName?: string
}

/**
 * Create an in-app notification in Supabase
 */
export async function createNotification({
  supabase,
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      link: link || null,
      is_read: false,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error creating notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Send an email notification via the API route
 */
export async function sendEmailNotification({
  to,
  type,
  title,
  message,
  link,
  recipientName,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        type,
        title,
        message,
        link,
        recipientName,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending email notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

interface NotifyUserParams {
  supabase: SupabaseClient
  userId: string
  userEmail?: string
  userName?: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * Send both in-app and email notifications to a user
 * This is the recommended function to use for all notifications
 */
export async function notifyUser({
  supabase,
  userId,
  userEmail,
  userName,
  type,
  title,
  message,
  link,
}: NotifyUserParams): Promise<{ inApp: boolean; email: boolean }> {
  const results = { inApp: false, email: false }

  // Create in-app notification
  const inAppResult = await createNotification({
    supabase,
    userId,
    type,
    title,
    message,
    link,
  })
  results.inApp = inAppResult.success

  // Send email notification if we have an email address
  if (userEmail) {
    const emailResult = await sendEmailNotification({
      to: userEmail,
      type,
      title,
      message,
      link,
      recipientName: userName,
    })
    results.email = emailResult.success
  }

  return results
}

/**
 * Get a user's email address from their profile
 */
export async function getUserEmail(
  supabase: SupabaseClient,
  userId: string
): Promise<{ email?: string; fullName?: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return {}
    }

    return { email: data.email, fullName: data.full_name }
  } catch {
    return {}
  }
}
