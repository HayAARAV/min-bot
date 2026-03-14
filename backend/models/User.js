const mongoose = require('mongoose');

const transactionLogSchema = new mongoose.Schema({
    currency: { type: String, enum: ['COIN', 'USD', 'DIAMOND', 'STAR'], required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    username: { type: String, default: '' },
    fullName: { type: String, default: '' },
    sponsorId: { type: String, default: null }, // telegram ID of direct referrer
    joinedAt: { type: Date, default: Date.now },
    walletAddress: { type: String, default: '' },
    walletLocked: { type: Boolean, default: false },
    balances: {
        COIN: { type: Number, default: 0 },
        USD: { type: Number, default: 0 },
        DIAMOND: { type: Number, default: 0 },
        STAR: { type: Number, default: 0 }
    },
    miningSpeed: { type: Number, default: 1 }, // coins per hour
    miningSession: {
        startTime: { type: Date, default: null },
        isActive: { type: Boolean, default: false },
        lastMinedAmount: { type: Number, default: 0 }
    },
    stats: {
        totalReferrals: { type: Number, default: 0 },
        totalTeamSize: { type: Number, default: 0 },
        dailyLogins: { type: Number, default: 0 },
        tasksCompleted: { type: Number, default: 0 }
    },
    lastDailyLogin: { type: String, default: null }, // YYYY-MM-DD
    completedTasks: [{ type: String }], // task IDs (for daily tasks, cleared on reset)
    completedPartnerTasks: [{ type: String }], // partner task IDs (permanent)
    logs: { type: [transactionLogSchema], default: [] },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
