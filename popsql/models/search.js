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
    ,	default: false }
    ,	formula: Schema.Types.Mixed
    ,	expires: Date
    ,	source: Schema.Types.Mixed
});

module.exports = mongoose.model('search', searchSchema);