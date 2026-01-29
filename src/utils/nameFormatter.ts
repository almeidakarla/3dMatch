/**
 * Format full name to hide last name for privacy
 * Example: "Karla Almeida" -> "Karla A."
 * Example: "Joao da Silva Santos" -> "Joao S."
 */
export const formatPrivateName = (fullName: string | null | undefined): string => {
  if (!fullName || typeof fullName !== 'string') {
    return 'User'
  }

  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0)

  if (nameParts.length === 0) {
    return 'User'
  }

  if (nameParts.length === 1) {
    return nameParts[0]
  }

  const firstName = nameParts[0]
  const lastNameInitial = nameParts[nameParts.length - 1][0].toUpperCase()

  return `${firstName} ${lastNameInitial}.`
}
