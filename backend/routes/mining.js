const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Config = require('../models/Config');
const { authMiddleware } = require('../middleware/auth');

function addLog(logs, currency, amount, type, description) {
    return [...logs, { currency, amount, type, description, timestamp: new Date() }].slice(-50);
}

// POST /api/mining/start
router.post('/start', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.miningSession.isActive) {
            return res.status(400).json({ error: 'Mining already active' });
        }
        user.miningSession.isActive = true;
        user.miningSession.startTime = new Date();
        await user.save();
        res.json({ message: 'Mining started', miningSession: user.miningSession });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/mining/claim — Claim mined coins and reset timer
router.post('/claim', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const config = await Config.findOne({ singleton: 'config' }) || await Config.create({});

        const now = new Date();
        const start = user.miningSession.startTime ? new Date(user.miningSession.startTime) : now;
        const diffMs = now.getTime() - start.getTime();
        const maxMs = config.miningSessionMinutes * 60 * 1000;
        const effectiveMs = Math.min(diffMs, maxMs);
        const diffHours = effectiveMs / 3600000;
        const mined = parseFloat((diffHours * user.miningSpeed).toFixed(6));

        user.balances.COIN += mined;
        user.miningSession.isActive = true;
        user.miningSession.startTime = now;
        user.miningSession.lastMinedAmount = mined;
        user.logs = addLog(user.logs, 'COIN', mined, 'CREDIT', 'Mining Claim');

        await user.save();
        res.json({ mined, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/mining/daily-login — Claim daily login bonus (Star)
router.post('/daily-login', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const today = new Date().toISOString().split('T')[0];
        if (user.lastDailyLogin === today) {
            return res.status(400).json({ error: 'Already claimed today' });
        }
        user.balances.STAR += 1;
        user.stats.dailyLogins += 1;
        user.lastDailyLogin = today;
        user.logs = addLog(user.logs, 'STAR', 1, 'CREDIT', 'Daily Login Bonus');
        await user.save();
        res.json({ message: 'Daily bonus claimed', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
