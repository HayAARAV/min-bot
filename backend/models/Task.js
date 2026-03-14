const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    type: { type: String, enum: ['daily', 'partner'], default: 'partner' },
    rewards: {
        coin: { type: Number, default: 0 },
        usd: { type: Number, default: 0 },
        diamond: { type: Number, default: 0 },
        star: { type: Number, default: 0 },
        speed: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
