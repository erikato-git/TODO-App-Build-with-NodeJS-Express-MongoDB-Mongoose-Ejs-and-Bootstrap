const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
    },
    time: {
        type: String
    }
})

const Task = mongoose.model('Task', taskSchema)
module.exports = Task








