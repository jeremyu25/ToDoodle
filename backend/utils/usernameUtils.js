import crypto from "crypto"

/**
 * Generates a 5-digit hash to append to usernames for OAuth users
 * @param {string} baseString - The string to generate hash from (email or unique identifier)
 * @returns {string} - A 5-digit numeric string
 */
const generateUsernameHash = (baseString) => {
    // Create a hash of the base string
    const hash = crypto.createHash('sha256').update(baseString).digest('hex')
    
    // Convert first 8 characters of hex to integer and take modulo to get 5 digits
    const hashInt = parseInt(hash.substring(0, 8), 16)
    const fiveDigitHash = (hashInt % 100000).toString().padStart(5, '0')
    
    return fiveDigitHash
}

/**
 * Creates a unique username for OAuth users by adding a 5-digit hash
 * @param {string} baseUsername - The base username (from display name or email)
 * @param {string} uniqueIdentifier - A unique identifier (email or provider ID) for hash generation
 * @returns {string} - The username with 5-digit hash appended
 */
const createOAuthUsername = (baseUsername, uniqueIdentifier) => {
    // Clean the base username (remove spaces, special characters, etc.)
    const cleanUsername = baseUsername.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
    
    // Generate 5-digit hash
    const hash = generateUsernameHash(uniqueIdentifier)
    
    // Combine username with hash
    return `${cleanUsername}_${hash}`
}

export { generateUsernameHash, createOAuthUsername }