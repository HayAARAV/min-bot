const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

function addLog(logs, currency, amount, type, description) {
    return [...logs, { currency, amount, type, description, timestamp: new Date() }].slice(-50);
}

// GET /api/tasks
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        const user = req.user;
        const enriched = tasks.map(t => ({
            ...t.toObject(),
            isCompleted: t.type === 'daily'
                ? user.completedTasks.includes(String(t._id))
                : user.completedPartnerTasks.includes(String(t._id))
        }));
        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/tasks/:id/complete
router.post('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || !task.isActive) return res.status(404).json({ error: 'Task not found' });

        const user = req.user;
        const taskId = String(task._id);

        // Check if already completed
        if (task.type === 'daily' && user.completedTasks.includes(taskId)) {
            return res.status(400).json({ error: 'Daily task already completed today' });
        }
        if (task.type === 'partner' && user.completedPartnerTasks.includes(taskId)) {
            return res.status(400).json({ error: 'Task already completed' });
        }

        // Award rewards
        if (task.rewards.coin) {
            user.balances.COIN += task.rewards.coin;
            user.logs = addLog(user.logs, 'COIN', task.rewards.coin, 'CREDIT', `Task: ${task.title}`);
        }
        if (task.rewards.usd) {
            user.balances.USD += task.rewards.usd;
            user.logs = addLog(user.logs, 'USD', task.rewards.usd, 'CREDIT', `Task: ${task.title}`);
        }
        if (task.rewards.diamond) {
            user.balances.DIAMOND += task.rewards.diamond;
            user.logs = addLog(user.logs, 'DIAMOND', task.rewards.diamond, 'CREDIT', `Task: ${task.title}`);
        }
        if (task.rewards.star) {
            user.balances.STAR += task.rewards.star;
            user.logs = addLog(user.logs, 'STAR', task.rewards.star, 'CREDIT', `Task: ${task.title}`);
        }
        if (task.rewards.speed) user.miningSpeed += task.rewards.speed;
        user.stats.tasksCompleted += 1;

        // Mark completed
        if (task.type === 'daily') {
            user.completedTasks.push(taskId);
        } else {
            user.completedPartnerTasks.push(taskId);
        }

        await user.save();
        res.json({ message: 'Task completed', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
