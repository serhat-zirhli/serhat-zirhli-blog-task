const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const CommentSchema = new Schema({
    author: {
        type: String,
        required : true
    },
    comment: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("Comment", CommentSchema)