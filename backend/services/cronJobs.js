import { CronJob } from 'cron'
import AuthModel from '../models/auth.model.js'

// Function to cleanup expired staging users
const cleanupExpiredUsers = async () => {
    try {
        const cleanedCount = await AuthModel.cleanupExpiredStagingUsers()
        console.log(`🧹 Cleanup job ran at ${new Date().toISOString()} - Cleaned up ${cleanedCount} expired staging users`)
    } catch (error) {
        console.error('❌ Error in cleanup job:', error.message)
    }
}

// Create cron job to run every 1 minute (for testing)
// Cron pattern: '0 * * * * *' means "at second 0 of every minute"
const cleanupJob = new CronJob(
    '*/10 * * * * *', // Every 10 minute
    cleanupExpiredUsers,
    null, // onComplete callback
    false, // start immediately
)

// Function to start all cron jobs
export const startCronJobs = () => {
    console.log('🕐 Starting cron jobs...')
    cleanupJob.start()
    console.log('✅ Cleanup job scheduled to run every 10 minute')
}

// Function to stop all cron jobs (useful for graceful shutdown)
export const stopCronJobs = () => {
    console.log('🛑 Stopping cron jobs...')
    cleanupJob.stop()
    console.log('✅ All cron jobs stopped')
}

// Export individual jobs if needed
export { cleanupJob }