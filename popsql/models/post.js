/*
 * post model
 */
var mongoose = require('mongoose')
   ,    Schema = mongoose.Schema
   ,    ObjectId = Schema.ObjectId;

var postSchema = new Schema({
        thread: ObjectId
    ,   date: { type: Date
    ,   default: Date.now }
    ,   author: { type: String
    ,   default: 'Guest' }
    ,   user_ip: String
    ,   post: String
    ,   tags: Array
    ,   adds: Array
});

module.exports = mongoose.model('Post', postSchema);