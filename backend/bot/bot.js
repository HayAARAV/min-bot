const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const Config = require('../models/Config');

function startBot() {
    const token = process.env.BOT_TOKEN;
    const miniAppUrl = process.env.MINI_APP_URL;

    if (!token || token === 'YOUR_BOT_TOKEN') {
        console.log('⚠️  Bot token not set, skipping bot startup');
        return null;
    }

    const bot = new TelegramBot(token, { polling: true });

    bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const telegramId = String(msg.from.id);
        const username = msg.from.username || `user_${telegramId}`;
        const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
        const param = match?.[1] || '';

        // Extract sponsorId from param like "ref_123456789"
        let sponsorId = null;
        if (param.startsWith('ref_')) {
            sponsorId = param.replace('ref_', '');
        }

        try {
            const config = await Config.findOne({ singleton: 'config' }) || await Config.create({});

            let user = await User.findOne({ telegramId });
            if (!user) {
                // Register new user
                const { default: authReg } = await import('../utils/register.js').catch(() => ({ default: null }));
                // Simple inline registration
                user = new User({
                    telegramId, username, fullName,
                    sponsorId: sponsorId !== telegramId ? sponsorId : null,
                    balances: { COIN: config.welcomeBonus.coin, USD: 0, DIAMOND: 0, STAR: 0 },
                    miningSpeed: config.welcomeBonus.speed,
                    logs: [{
                        currency: 'COIN', amount: config.welcomeBonus.coin,
                        type: 'CREDIT', description: 'Welcome Bonus', timestamp: new Date()
                    }]
                });
                await user.save();

                // Award referral chain
                if (sponsorId && sponsorId !== telegramId) {
                    let currentSponsorId = sponsorId;
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
                        sponsor.logs.push({ currency: 'COIN', amount: reward.coin || 0, type: 'CREDIT', description: `Referral Lv${i + 1}: @${username}`, timestamp: new Date() });
                        await sponsor.save();
                        currentSponsorId = sponsor.sponsorId;
                    }
                }
            }

            const welcomeText = sponsorId
                ? `🎉 *Welcome to GYK Mining Bot, @${username}!*\n\nYou joined via a referral link. Your sponsor will receive rewards!\n\n⛏️ Your welcome bonus: *${config.welcomeBonus.coin} ${config.coinName}*\n🚀 Default mining speed: *${config.welcomeBonus.speed} coins/hr*\n\nStart mining and earn real rewards!`
                : `🎉 *Welcome to GYK Mining Bot, @${username}!*\n\n⛏️ Start mining ${config.coinName} coins and earn real money!\n\nYour welcome bonus: *${config.welcomeBonus.coin} ${config.coinName}*\n🚀 Mining speed: *${config.welcomeBonus.speed} coins/hr*`;

            await bot.sendMessage(chatId, welcomeText, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: '⛏️ Open Mining App',
                            web_app: { url: miniAppUrl }
                        }
                    ]]
                }
            });
        } catch (err) {
            console.error('Bot /start error:', err.message);
            await bot.sendMessage(chatId, '⚠️ Error starting bot. Please try again.');
        }
    });

    // Handle /help
    bot.onText(/\/help/, async (msg) => {
        await bot.sendMessage(msg.chat.id,
            `📌 *GYK Mining Bot Help*\n\n` +
            `/start - Open the mining app\n` +
            `/ref - Get your referral link\n\n` +
            `For support, use the Support page inside the app.`,
            { parse_mode: 'Markdown' }
        );
    });

    // Handle /ref
    bot.onText(/\/ref/, async (msg) => {
        const telegramId = String(msg.from.id);
        const refLink = `https://t.me/${process.env.BOT_USERNAME}?start=ref_${telegramId}`;
        await bot.sendMessage(msg.chat.id,
            `🔗 *Your Referral Link:*\n\n\`${refLink}\`\n\nShare this link and earn rewards when friends join!`,
            { parse_mode: 'Markdown' }
        );
    });

    bot.on('polling_error', (err) => {
        console.error('Bot polling error:', err.message);
    });

    console.log('🤖 Telegram Bot started (long-polling)');
    return bot;
}

module.exports = { startBot };
