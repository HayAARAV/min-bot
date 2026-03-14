const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const Withdrawal = require('../models/Withdrawal');
const Config = require('../models/Config');
const Support = require('../models/Support');
const { adminMiddleware } = require('../middleware/auth');

// Apply admin middleware to all routes
router.use(adminMiddleware);

function addLog(logs, currency, amount, type, description) {
    return [...logs, { currency, amount, type, description, timestamp: new Date() }].slice(-50);
}

// ── STATS ──────────────────────────────────────────────────────────

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'PENDING' });
        const totalCoins = await User.aggregate([{ $group: { _id: null, total: { $sum: '$balances.COIN' } } }]);
        const totalUsd = await User.aggregate([{ $group: { _id: null, total: { $sum: '$balances.USD' } } }]);
        res.json({
            totalUsers,
            pendingWithdrawals,
            totalCoins: totalCoins[0]?.total || 0,
            totalUsd: totalUsd[0]?.total || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── USERS ──────────────────────────────────────────────────────────

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-logs');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/users/:telegramId
router.get('/users/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/users/:telegramId/wallet — Admin can update wallet
router.patch('/users/:telegramId/wallet', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.walletAddress = walletAddress;
        user.walletLocked = true;
        await user.save();
        res.json({ message: 'Wallet updated by admin', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/users/:telegramId/balance — Admin credit/debit
router.patch('/users/:telegramId/balance', async (req, res) => {
    try {
        const { currency, amount, type, reason } = req.body;
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (type === 'CREDIT') user.balances[currency] += amount;
        else user.balances[currency] = Math.max(0, user.balances[currency] - amount);
        user.logs = addLog(user.logs, currency, amount, type, `Admin: ${reason || 'Manual adjustment'}`);
        await user.save();
        res.json({ message: 'Balance updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── TASKS ──────────────────────────────────────────────────────────

// GET /api/admin/tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ order: 1, createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/tasks
router.post('/tasks', async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/tasks/:id
router.patch('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/tasks/:id
router.delete('/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── WITHDRAWALS ─────────────────────────────────────────────────────

// GET /api/admin/withdrawals
router.get('/withdrawals', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const withdrawals = await Withdrawal.find(filter).sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/withdrawals/:id — Approve or Reject
router.patch('/withdrawals/:id', async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
        if (withdrawal.status !== 'PENDING') return res.status(400).json({ error: 'Already processed' });

        withdrawal.status = status;
        withdrawal.remarks = remarks || '';
        await withdrawal.save();

        // If rejected, refund user
        if (status === 'REJECTED') {
            const user = await User.findOne({ telegramId: withdrawal.userId });
            if (user) {
                user.balances.USD += withdrawal.amountUsd;
                user.balances.DIAMOND += withdrawal.feeAmount;
                user.logs = addLog(user.logs, 'USD', withdrawal.amountUsd, 'CREDIT', `Withdrawal Refund: ${remarks || 'Rejected'}`);
                user.logs = addLog(user.logs, 'DIAMOND', withdrawal.feeAmount, 'CREDIT', `Fee Refund: ${remarks || 'Rejected'}`);
                await user.save();
            }
        }

        res.json({ message: `Withdrawal ${status}`, withdrawal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── CONFIG ─────────────────────────────────────────────────────────

// GET /api/admin/config
router.get('/config', async (req, res) => {
    try {
        let config = await Config.findOne({ singleton: 'config' });
        if (!config) config = await Config.create({});
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/config
router.patch('/config', async (req, res) => {
    try {
        let config = await Config.findOne({ singleton: 'config' });
        if (!config) config = await Config.create({});
        Object.assign(config, req.body);
        await config.save();
        res.json({ message: 'Config updated', config });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── SUPPORT ─────────────────────────────────────────────────────────

// GET /api/admin/support
router.get('/support', async (req, res) => {
    try {
        let support = await Support.findOne({}) || await Support.create({});
        res.json(support);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/support
router.patch('/support', async (req, res) => {
    try {
        let support = await Support.findOne({}) || await Support.create({});
        Object.assign(support, req.body);
        await support.save();
        res.json({ message: 'Support updated', support });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── VERIFY ADMIN PASSWORD ───────────────────────────────────────────

// POST /api/admin/verify — verify admin panel password
router.post('/verify', async (req, res) => {
    try {
        const { password } = req.body;
        const config = await Config.findOne({ singleton: 'config' }) || await Config.create({});
        if (password !== config.adminPassword) {
            return res.status(401).json({ error: 'Wrong password' });
        }
        res.json({ verified: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
