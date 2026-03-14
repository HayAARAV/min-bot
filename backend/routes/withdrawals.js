const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Config = require('../models/Config');
const { authMiddleware } = require('../middleware/auth');

function addLog(logs, currency, amount, type, description) {
    return [...logs, { currency, amount, type, description, timestamp: new Date() }].slice(-50);
}

// GET /api/withdrawals/mine
router.get('/mine', authMiddleware, async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ userId: req.user.telegramId }).sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/withdrawals/request
router.post('/request', authMiddleware, async (req, res) => {
    try {
        const { amountUsd } = req.body;
        const user = req.user;
        const config = await Config.findOne({ singleton: 'config' }) || await Config.create({});

        if (amountUsd < config.minWithdrawal || amountUsd > config.maxWithdrawal) {
            return res.status(400).json({ error: `Amount must be between $${config.minWithdrawal} and $${config.maxWithdrawal}` });
        }
        if (user.balances.USD < amountUsd) {
            return res.status(400).json({ error: 'Insufficient USD balance' });
        }
        if (!user.walletAddress) {
            return res.status(400).json({ error: 'Please set your wallet address first' });
        }

        const feeAmount = Math.ceil(amountUsd * config.withdrawalFeePerUsd);
        if (user.balances.DIAMOND < feeAmount) {
            return res.status(400).json({ error: `Insufficient diamonds. Need ${feeAmount}💎 as fee` });
        }

        // Deduct
        user.balances.USD -= amountUsd;
        user.balances.DIAMOND -= feeAmount;
        user.logs = addLog(user.logs, 'USD', amountUsd, 'DEBIT', 'Withdrawal Request');
        user.logs = addLog(user.logs, 'DIAMOND', feeAmount, 'DEBIT', 'Withdrawal Fee');
        await user.save();

        const withdrawal = await Withdrawal.create({
            userId: user.telegramId,
            username: user.username,
            amountUsd,
            feeAmount,
            walletAddress: user.walletAddress,
            status: 'PENDING'
        });

        res.json({ message: 'Withdrawal requested', withdrawal, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
