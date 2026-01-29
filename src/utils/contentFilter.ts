/**
 * Content Filtering Utility
 * Prevents users from sharing contact information (emails, phones, social media, etc.)
 */

const BLOCKED_PATTERNS: Record<string, RegExp> = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  phone: /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{4,5}[-.\s]?\d{4}/g,
  whatsapp: /whats?app|wpp|zap/gi,
  instagram: /instagram|insta|@\w+/gi,
  facebook: /facebook|fb\.com/gi,
  linkedin: /linkedin|linked\.in/gi,
  twitter: /twitter|@\w+/gi,
  url: /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi,
  contactPhrases: /\b(meu\s*(email|e-mail|telefone|celular|whats|numero)|(me\s*chama|me\s*add|adiciona)(\s*(no|na))?\s*(whats|insta|face|zap))\b/gi,
  blockedWords: /\b(portfolio|portfólio|behance|artstation|dribbble)\b/gi,
}

const VIOLATION_MESSAGES: Record<string, string> = {
  email: 'Emails are not allowed. Keep communication within the platform.',
  phone: 'Phone numbers are not allowed. Use the platform messaging system.',
  whatsapp: 'WhatsApp references are not allowed. Use the platform chat.',
  instagram: 'Social media mentions are not allowed.',
  facebook: 'Social media mentions are not allowed.',
  linkedin: 'Social media mentions are not allowed.',
  twitter: 'Social media mentions are not allowed.',
  url: 'URLs and links are not allowed.',
  contactPhrases: 'External contact requests are not allowed.',
  blockedWords: 'Sharing portfolios or external links is not allowed. Keep everything on the platform.',
}

interface ValidationResult {
  isValid: boolean
  violations: string[]
  message: string
}

interface Violation {
  type: string
  match: string
  message: string
}

interface ProfileValidation {
  isValid: boolean
  errors: Record<string, string>
}

export function validateContent(content: string): ValidationResult {
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return { isValid: true, violations: [], message: '' }
  }

  const violations: string[] = []
  const messages: string[] = []

  for (const [key, pattern] of Object.entries(BLOCKED_PATTERNS)) {
    try {
      if (pattern.test(content)) {
        violations.push(key)
        messages.push(VIOLATION_MESSAGES[key])
      }
    } catch (err) {
      console.error(`Error checking pattern ${key}:`, err)
    }
  }

  if (violations.length > 0) {
    return {
      isValid: false,
      violations,
      message: messages[0],
    }
  }

  return { isValid: true, violations: [], message: '' }
}

export function sanitizeContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return content || ''
  }

  let sanitized = content

  try {
    for (const pattern of Object.values(BLOCKED_PATTERNS)) {
      sanitized = sanitized.replace(pattern, '[BLOCKED CONTENT]')
    }
  } catch (err) {
    console.error('Error sanitizing content:', err)
    return content
  }

  return sanitized
}

export function extractViolations(content: string): Violation[] {
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return []
  }

  const violations: Violation[] = []

  for (const [key, pattern] of Object.entries(BLOCKED_PATTERNS)) {
    try {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach(match => {
          violations.push({
            type: key,
            match,
            message: VIOLATION_MESSAGES[key],
          })
        })
      }
    } catch (err) {
      console.error(`Error extracting violations for pattern ${key}:`, err)
    }
  }

  return violations
}

export function validateArtistProfile(profileData: {
  full_name?: string
  other_software?: string
  bio?: string
}): ProfileValidation {
  const errors: Record<string, string> = {}

  if (profileData.full_name) {
    const nameCheck = validateContent(profileData.full_name)
    if (!nameCheck.isValid) {
      errors.full_name = nameCheck.message
    }
  }

  if (profileData.other_software) {
    const softwareCheck = validateContent(profileData.other_software)
    if (!softwareCheck.isValid) {
      errors.other_software = softwareCheck.message
    }
  }

  if (profileData.bio) {
    errors.bio = 'Biography is no longer allowed. Use the structured fields.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateMessage(message: string): ValidationResult {
  return validateContent(message)
}

export function getTypingWarning(content: string): string | null {
  if (!content || content.length < 3) {
    return null
  }

  const result = validateContent(content)
  if (!result.isValid) {
    return 'Warning: Do not share contact information'
  }

  return null
}
