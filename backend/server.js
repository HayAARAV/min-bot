require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const miningRoutes = require('./routes/mining');
const taskRoutes = require('./routes/tasks');
const withdrawalRoutes = require('./routes/withdrawals');
const configRoutes = require('./routes/config');
const adminRoutes = require('./routes/admin');
const { startBot } = require('./bot/bot');
const { startDailyReset } = require('./cron/dailyReset');
const { startKeepAlive } = require('./cron/keepAlive');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mining', miningRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/config', configRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');

        // Start Telegram bot
        startBot();

        // Start daily cron
        startDailyReset();

        // Keep-alive ping (prevents Render free tier from sleeping)
        startKeepAlive();

        // Start server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
