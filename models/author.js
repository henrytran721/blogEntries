var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        last_name: {type: String, required: true, max: 100},
        date_of_birth: {type: Date}
    }
)

AuthorSchema
    .virtual('name')
    .get(function() {
        var fullname = '';
        if(this.first_name && this.last_name) {
            fullname = this.first_name + ' ' + this.last_name;
        } else {
            fullname = '';
        }
        return fullname;
    });

AuthorSchema
    .virtual('url')
    .get(function() {
        return '/blog/author/' + this._id;
    })

module.exports = mongoose.model('Author', AuthorSchema);