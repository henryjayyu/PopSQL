/*
 * search model
 */
var mongoose = require('mongoose')
   ,    Schema = mongoose.Schema
   ,    ObjectId = Schema.ObjectId;

var searchSchema = new Schema({
		query: String
    ,	poll: Number
    ,   response: String
    ,   has_formula: { type: Boolean
    ,	default: false}
    ,	formula: Array
});

module.exports = mongoose.model('search', searchSchema);