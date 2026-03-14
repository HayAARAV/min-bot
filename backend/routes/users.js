const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Config = require('../models/Config');
const { authMiddleware } = require('../middleware/auth');

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        res.json(req.user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/referrals — Get 5-level downline counts
router.get('/referrals', authMiddleware, async (req, res) => {
    try {
        const telegramId = req.user.telegramId;
        const levels = [];

        let currentLevel = [telegramId];
        for (let i = 0; i < 5; i++) {
            const nextLevel = await User.find({ sponsorId: { $in: currentLevel } }).select('telegramId username fullName joinedAt');
            levels.push(nextLevel);
            currentLevel = nextLevel.map(u => u.telegramId);
            if (currentLevel.length === 0) break;
        }

        res.json({ levels });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/users/wallet — One-time wallet address set
router.patch('/wallet', authMiddleware, async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) return res.status(400).json({ error: 'Wallet address required' });
        if (req.user.walletLocked) {
            return res.status(400).json({ error: 'Wallet address is already locked. Contact admin.' });
        }
        req.user.walletAddress = walletAddress;
        req.user.walletLocked = true;
        await req.user.save();
        res.json({ message: 'Wallet set and locked', user: req.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
