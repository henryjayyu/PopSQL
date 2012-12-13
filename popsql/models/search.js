/*
 * search model
 */
var mongoose = require('mongoose')
   ,    Schema = mongoose.Schema
   ,    ObjectId = Schema.ObjectId;

var searchSchema = new Schema({
    	user_ip: String
    ,   author: { type: String
    ,   default: 'Guest' }
    ,   query: String
    ,	poll: Number
    ,   response: String
    ,   conditional: Boolean
});

module.exports = mongoose.model('search', searchSchema);