/*
 * city model
 */
var mongoose = require('mongoose')
   ,    Schema = mongoose.Schema
   ,    ObjectId = Schema.ObjectId;

var citySchema = new Schema({
        thread: ObjectId
    ,   name: String
    ,   state: String
    ,   zip: String
});

module.exports = mongoose.model('City', citySchema);