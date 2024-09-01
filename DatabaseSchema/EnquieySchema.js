const mongoose  = require('mongoose');

const enquierySchema = new mongoose.Schema({
    verndorName: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    emailID: {
        type: String,
        required: true,
    },
    enquiryBox: {
        type: String,
        required: true,
    }
})

const Enquiry = mongoose.model('Enquiry', enquierySchema);
module.exports = Enquiry;