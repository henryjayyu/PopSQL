/*
 * library model
 */
var mongoose = require('mongoose')
   ,    Schema = mongoose.Schema
   ,    ObjectId = Schema.ObjectId;

var postSchema = new Schema({
        team: String
    ,   location: Array
    ,   conf: String
    ,   league: String
    ,   sport: String
    ,   keywords: Array
    ,   routes: Array
});

module.exports = mongoose.model('library', postSchema);