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
    ,   handle: { type: String
    ,   default: '@guest' }
    ,   user_ip: String
    ,   spriteID: { type: String
    ,   default: '/images/guest_a.png'}
    ,   post: String
    ,   tags: Array
    ,   adds: Array
});

module.exports = mongoose.model('Post', postSchema);