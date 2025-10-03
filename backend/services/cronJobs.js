import { CronJob } from 'cron'
import AuthModel from '../models/auth.model.js'

// Function to cleanup expired staging users and email changes
const cleanupExpiredUsers = async () => {
    try {
        const [cleanedStagingUsers, cleanedEmailChanges] = await Promise.all([
            AuthModel.cleanupExpiredStagingUsers(),
            AuthModel.cleanupExpiredEmailChanges()
        ])
        
        console.log(`🧹 Cleanup job ran at ${new Date().toISOString()}`)
        console.log(`   - Cleaned up ${cleanedStagingUsers} expired staging users`)
        console.log(`   - Cleaned up ${cleanedEmailChanges} expired email changes`)
    } catch (error) {
        console.error('❌ Error in cleanup job:', error.message)
    }
}

// Create cron job to run every 1 minute (for testing)
// Cron pattern: '0 * * * * *' means "at second 0 of every minute"
const cleanupJob = new CronJob(
    "0 0 0 * * *", // At 00:00:00 every day (midnight)
    cleanupExpiredUsers,
    null, // onComplete callback
    false, // start immediately
)

// Function to start all cron jobs
export const startCronJobs = () => {
    console.log('🕐 Starting cron jobs...')
    cleanupJob.start()
    console.log('✅ Cleanup job scheduled to run every midnight')
}

// Function to stop all cron jobs (useful for graceful shutdown)
export const stopCronJobs = () => {
    console.log('🛑 Stopping cron jobs...')
    cleanupJob.stop()
    console.log('✅ All cron jobs stopped')
}

// Export individual jobs if needed
export { cleanupJob }