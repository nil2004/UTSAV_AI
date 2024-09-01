const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    vendorType: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageLink: {
        type: String,
        required: true
    }
});

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;