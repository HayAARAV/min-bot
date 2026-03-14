const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    singleton: { type: String, default: 'config', unique: true },
    coinName: { type: String, default: 'GYK Coin' },
    coinIcon: { type: String, default: '⛏️' },
    welcomeBonus: {
        coin: { type: Number, default: 50 },
        speed: { type: Number, default: 1 }
    },
    referralRewards: {
        lev1: { coin: { type: Number, default: 50 }, speed: { type: Number, default: 0.1 }, usd: { type: Number, default: 0.02 }, diamond: { type: Number, default: 1 } },
        lev2: { coin: { type: Number, default: 30 }, speed: { type: Number, default: 0.05 }, usd: { type: Number, default: 0.01 }, diamond: { type: Number, default: 0 } },
        lev3: { coin: { type: Number, default: 20 }, speed: { type: Number, default: 0.03 }, usd: { type: Number, default: 0.005 }, diamond: { type: Number, default: 0 } },
        lev4: { coin: { type: Number, default: 10 }, speed: { type: Number, default: 0.02 }, usd: { type: Number, default: 0 }, diamond: { type: Number, default: 0 } },
        lev5: { coin: { type: Number, default: 10 }, speed: { type: Number, default: 0.01 }, usd: { type: Number, default: 0 }, diamond: { type: Number, default: 0 } }
    },
    miningSessionMinutes: { type: Number, default: 480 }, // 8 hours
    minWithdrawal: { type: Number, default: 1 },
    maxWithdrawal: { type: Number, default: 100 },
    withdrawalFeePerUsd: { type: Number, default: 1 }, // diamonds per $1
    adsgramToken: { type: String, default: '' },
    adLink: { type: String, default: '' }, // fallback ad link
    miningPicture: { type: String, default: '' },
    adminPassword: { type: String, default: 'admin123' },
    socialLinks: {
        telegram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        youtube: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' }
    },
    airdrop: {
        title: { type: String, default: 'AIRDROP LIVE SOON' },
        description: { type: String, default: 'We are currently in the mining phase.' },
        phase: { type: String, default: 'Pre-Listing' },
        countdown: { type: String, default: 'Q4 2025' },
        roadmap: { type: String, default: '' }
    },
    rules: { type: String, default: 'Rules and eligibility criteria will be updated soon.' },
    welcomeMessage: { type: String, default: 'Welcome to GYK Mining Bot! Start mining and earn real rewards.' }
}, { timestamps: true });

module.exports = mongoose.model('Config', configSchema);
