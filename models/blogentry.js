var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var BlogEntrySchema = new Schema( 
    {
        title: {type: String, max: 100, required: true},
        description: {type: String, required: true},
        imageURL: {type: String},
        date: {type: Date, default: Date.now},
        author: {type: Schema.Types.ObjectId, ref: 'Author'}
    }
)

BlogEntrySchema
    .virtual('url')
    .get(function() {
        return '/blog/blog_entry/' + this._id;
    })

BlogEntrySchema
    .virtual('date_formatted')
    .get(() => {
        return moment(this.date).format('MMMM Do, YYYY');
    })
module.exports = mongoose.model('Blog Entry', BlogEntrySchema);