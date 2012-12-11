/*
 * library model
 */
var mongoose = require('mongoose')
   ,    Schema = mongoose.Schema
   ,    ObjectId = Schema.ObjectId;

var postSchema = new Schema({
        team: String
    ,   city: String
    ,   state: String
    ,   conf: String
    ,   league: String
    ,   sport: String
    ,   tokens: Array
});

module.exports = mongoose.model('library', postSchema);