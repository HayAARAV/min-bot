const cron = require('node-cron');
const User = require('../models/User');

// Reset daily tasks at 00:00 UTC
function startDailyReset() {
    cron.schedule('0 0 * * *', async () => {
        try {
            const result = await User.updateMany({}, { $set: { completedTasks: [] } });
            console.log(`✅ Daily reset: cleared completedTasks for ${result.modifiedCount} users at ${new Date().toISOString()}`);
        } catch (err) {
            console.error('Daily reset error:', err.message);
        }
    }, { timezone: 'UTC' });

    console.log('⏰ Daily reset cron scheduled (00:00 UTC)');
}

module.exports = { startDailyReset };
