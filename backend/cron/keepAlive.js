const cron = require('node-cron');
const https = require('https');

// Keep-alive ping: prevents Render.com free tier from sleeping
// Sends GET request every 14 minutes (Render sleeps after 15 min of inactivity)

// CRON EXPRESSION EXPLANATION:
// MINUTE, HOUR, DAY OF MONTH, MONTH, DAY OF WEEK
// */14 * * * *  → every 14 minutes

function startKeepAlive() {
    if (!process.env.API_URL) {
        console.log('⚠️  Keep-alive skipped: API_URL not set in .env');
        return;
    }

    cron.schedule('*/14 * * * *', () => {
        https
            .get(process.env.API_URL, (res) => {
                if (res.statusCode === 200) {
                    console.log(`✅ Keep-alive ping sent successfully [${new Date().toISOString()}]`);
                } else {
                    console.log(`⚠️  Keep-alive ping failed — status: ${res.statusCode}`);
                }
            })
            .on('error', (e) => {
                console.error('❌ Keep-alive error:', e.message);
            });
    });

    console.log('🔁 Keep-alive cron scheduled (every 14 minutes)');
}

module.exports = { startKeepAlive };
