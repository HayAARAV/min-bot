const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // telegramId
    username: { type: String, default: '' },
    amountUsd: { type: Number, required: true },
    feeAmount: { type: Number, default: 0 }, // diamonds collected as fee
    walletAddress: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    remarks: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
