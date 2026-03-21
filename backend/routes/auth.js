const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Config = require('../models/Config');

// Helper: Add a transaction log entry
function addLog(logs, currency, amount, type, description) {
    return [...logs, {
        currency, amount, type, description,
        timestamp: new Date()
    }].slice(-50); // keep latest 50
}

// Helper: Award referral rewards up 5 levels
async function awardReferralChain(newUser, config) {
    let currentSponsorId = newUser.sponsorId;
    const levels = ['lev1', 'lev2', 'lev3', 'lev4', 'lev5'];

    for (let i = 0; i < 5; i++) {
        if (!currentSponsorId) break;
        const sponsor = await User.findOne({ telegramId: currentSponsorId });
        if (!sponsor) break;

        const reward = config.referralRewards[levels[i]];
        sponsor.balances.COIN += reward.coin || 0;
        sponsor.balances.USD += reward.usd || 0;
        sponsor.balances.DIAMOND += reward.diamond || 0;
        sponsor.miningSpeed += reward.speed || 0;
        if (i === 0) sponsor.stats.totalReferrals += 1;
        sponsor.stats.totalTeamSize += 1;

        if (reward.coin) sponsor.logs = addLog(sponsor.logs, 'COIN', reward.coin, 'CREDIT', `Referral Lv${i + 1}: @${newUser.username}`);
        if (reward.usd) sponsor.logs = addLog(sponsor.logs, 'USD', reward.usd, 'CREDIT', `Referral Lv${i + 1}: @${newUser.username}`);
        if (reward.diamond) sponsor.logs = addLog(sponsor.logs, 'DIAMOND', reward.diamond, 'CREDIT', `Referral Lv${i + 1}: @${newUser.username}`);

        await sponsor.save();
        currentSponsorId = sponsor.sponsorId;
    }
}

// POST /api/auth/telegram — validate Telegram WebApp initData and return JWT
router.post('/telegram', async (req, res) => {
    try {
        const { initData, sponsorId } = req.body;

        // Parse initData
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        params.delete('hash');
        const dataCheckString = [...params.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join('\n');

        // Verify with bot token
        const secretKey = crypto.createHmac('sha256', 'WebAppData')
            .update(process.env.BOT_TOKEN)
            .digest();
        const expectedHash = crypto.createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // In development, skip hash check if initData is a test payload
        const isDev = process.env.NODE_ENV !== 'production';
        if (!isDev && hash !== expectedHash) {
            return res.status(401).json({ error: 'Invalid Telegram data' });
        }

        // Parse user data
        let tgUser;
        try {
            const rawUser = params.get('user');
            tgUser = rawUser ? JSON.parse(rawUser) : null;
        } catch {
            tgUser = null;
        }
        // Dev mode or missing user field — use fallback
        if (!tgUser || !tgUser.id) {
            tgUser = { id: 12345678, username: 'dev_user', first_name: 'Dev', last_name: 'User' };
        }

        const telegramId = String(tgUser.id);
        const username = tgUser.username || `user_${telegramId}`;
        const fullName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim();

        let config = await Config.findOne({ singleton: 'config' });
        if (!config) {
            try {
                config = await Config.create({ singleton: 'config' });
            } catch (e) {
                // E11000 duplicate key — another request created it first, fetch it
                config = await Config.findOne({ singleton: 'config' });
            }
        }
        if (!config) throw new Error('Could not initialise config');


        let user = await User.findOne({ telegramId });
        if (!user) {
            // New user - create with welcome bonus
            user = new User({
                telegramId,
                username,
                fullName,
                sponsorId: sponsorId || null,
                balances: {
                    COIN: config.welcomeBonus.coin,
                    USD: 0,
                    DIAMOND: 0,
                    STAR: 0
                },
                miningSpeed: config.welcomeBonus.speed,
            });
            user.logs = addLog(user.logs, 'COIN', config.welcomeBonus.coin, 'CREDIT', 'Welcome Bonus');
            await user.save();
            // Award referral chain
            if (sponsorId) await awardReferralChain(user, config);
        } else {
            // Update username/name if changed
            user.username = username;
            user.fullName = fullName;
            await user.save();
        }

        const token = jwt.sign({ telegramId }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user });
    } catch (err) {
        console.error('Auth error full stack:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

module.exports = router;
