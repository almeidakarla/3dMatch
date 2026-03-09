import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend lazily to avoid build-time errors
let resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const FROM_EMAIL = process.env.FROM_EMAIL || '3DMatch <noreply@3dmatch.com>'

export type NotificationType =
  | 'application_accepted'
  | 'application_rejected'
  | 'project_invite'
  | 'project_delivered'
  | 'revision_requested'
  | 'new_message'
  | 'payment_received'

interface SendEmailRequest {
  to: string
  type: NotificationType
  title: string
  message: string
  link?: string
  recipientName?: string
}

function getEmailSubject(type: NotificationType, title: string): string {
  const prefixes: Record<NotificationType, string> = {
    application_accepted: 'Great news!',
    application_rejected: 'Application Update',
    project_invite: 'New Opportunity',
    project_delivered: 'Project Update',
    revision_requested: 'Action Required',
    new_message: 'New Message',
    payment_received: 'Payment Confirmed',
  }
  return `${prefixes[type] || ''} ${title}`.trim()
}

function generateEmailHtml(
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  recipientName?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://3dmatch.com'
  const fullLink = link ? `${baseUrl}${link}` : baseUrl

  const ctaText: Record<NotificationType, string> = {
    application_accepted: 'View Project',
    application_rejected: 'View Applications',
    project_invite: 'View Project',
    project_delivered: 'Review Delivery',
    revision_requested: 'View Details',
    new_message: 'View Message',
    payment_received: 'View Details',
  }

  const iconColors: Record<NotificationType, string> = {
    application_accepted: '#22c55e',
    application_rejected: '#ef4444',
    project_invite: '#3b82f6',
    project_delivered: '#8b5cf6',
    revision_requested: '#f59e0b',
    new_message: '#06b6d4',
    payment_received: '#22c55e',
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">3DMatch</h1>
            </td>
          </tr>

          <!-- Status indicator -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${iconColors[type]}20; display: inline-flex; align-items: center; justify-content: center;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${iconColors[type]};"></div>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px 40px;">
              ${recipientName ? `<p style="margin: 0 0 16px; color: #71717a; font-size: 14px;">Hi ${recipientName},</p>` : ''}
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">${title}</h2>
              <p style="margin: 0 0 24px; color: #3f3f46; font-size: 16px; line-height: 1.6;">${message}</p>

              ${link ? `
              <a href="${fullLink}" style="display: inline-block; padding: 14px 28px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                ${ctaText[type] || 'View Details'}
              </a>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px;">
                You received this email because you have an account on 3DMatch.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                <a href="${baseUrl}/dashboard/notifications" style="color: #71717a;">Manage notifications</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export async function POST(request: NextRequest) {
  try {
    const resendClient = getResend()
    if (!resendClient) {
      console.warn('RESEND_API_KEY not configured, skipping email')
      return NextResponse.json({ success: true, skipped: true, reason: 'Email not configured' })
    }

    const body: SendEmailRequest = await request.json()
    const { to, type, title, message, link, recipientName } = body

    if (!to || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type, title, message' },
        { status: 400 }
      )
    }

    const { data, error } = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject: getEmailSubject(type, title),
      html: generateEmailHtml(type, title, message, link, recipientName),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
