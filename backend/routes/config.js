const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const Support = require('../models/Support');

// GET /api/config — public
router.get('/', async (req, res) => {
    try {
        let config = await Config.findOne({ singleton: 'config' });
        if (!config) config = await Config.create({});
        // Don't expose admin password
        const { adminPassword, ...safeConfig } = config.toObject();
        res.json(safeConfig);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/config/support — public
router.get('/support', async (req, res) => {
    try {
        let support = await Support.findOne({ isActive: true });
        if (!support) support = await Support.create({});
        res.json(support);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
