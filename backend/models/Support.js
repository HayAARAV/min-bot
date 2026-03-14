const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    title: { type: String, default: 'Support Center' },
    description: { type: String, default: 'Contact us for any queries.' },
    telegramLink: { type: String, default: '' },
    email: { type: String, default: '' },
    extraLinks: [{ label: String, url: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Support', supportSchema);
