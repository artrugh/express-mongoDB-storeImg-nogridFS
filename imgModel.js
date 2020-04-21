const mongoose = require('mongoose');
const { Schema } = mongoose;

const Image = new Schema({

    img: {
        name: {
            type: String,
            required: true
        },
        file: {
            type: Buffer
        }
    }
});

module.exports = mongoose.model("Image", Image);