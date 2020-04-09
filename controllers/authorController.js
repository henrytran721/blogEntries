// import author model
var Author = require('../models/author');
var async = require('async');
var BlogEntry = require('../models/blogentry');

// import sanitization and validation libraries
var { body, validationResult } = require('express-validator');
var { sanitizeBody } = require('express-validator');

exports.author_list = (req,res) => {
    Author.find()
    // populates with the author model with previously inputted data
        .populate('author')
        .exec((err, list_authors) => {
            if(err) {return next(err)};
            res.render('author_list', {title: 'Author List', author_list: list_authors});
        })
}


exports.author_detail = (req, res, next) => {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
                .exec(callback)
        },
        author_entries: function(callback){
            BlogEntry.find({'author': req.params.id}, 'title date_formatted description')
                .exec(callback)
        }
    }, function(err, results) {
        if(err) {return next(err)}
        if(results.author === null) {
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail', {title: 'Author Details', author: results.author, author_entries: results.author_entries})
    })
}

// Create Functions
exports.author_create_get = (req, res) => {
    res.render('author_form', {title:'Create Author Form'})
}

// Handle Author Create with POST method
exports.author_create_post = [
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters'),
    body('last_name').isLength({ min: 1}).trim().withMessage('Last name is required')
        .isAlphanumeric().withMessage('Last name has non-alphanumeric characters'),
    body('date_of_birth', 'Invalid date of birth').optional( {checkFalsy: true }).isISO8601(),

    sanitizeBody('first_name').escape(),
    sanitizeBody('last_name').escape(),
    sanitizeBody('date_of_birth').toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation errors from a request 
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            // errors are present. Render the form again with sanitized values / error message
            res.render('author_form', {title: 'Create Author', author: req.body, errors: errors.array()});
            return;
        } else {
            // data from form is valid
            // create an author object with escaped and trimmed data
            var author = new Author(
                {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    date_of_birth: req.body.date_of_birth,
                }
            );

            author.save(function(err) {
                if(err) { return next(err); }
                res.redirect(author.url);
            })
        }
    }
]

// Delete Functions
exports.author_delete_get = (req, res, next) => {
    async.parallel(
        {
            author: function(callback) {
                // locate specified author based on it's ID
                Author.findById(req.params.id)
                    .exec(callback)
            },
            author_posts: function(callback) {
                BlogEntry.find({'author': req.params.id})
                    .exec(callback)
            }
        }, function(err, results ) {
            if(err) {
                return next(err);
            }
            if(results.authors === null) {
                res.redirect('/blog/authors')
            }
            res.render('author_delete', {title: 'Delete Author', author: results.author, author_posts: results.author_posts})
        }
    )
}

exports.author_delete_post = (req, res, next) => {
    async.parallel(
        {
            author: function(callback) {
                Author.findById(req.body.authorid)
                    .exec(callback)
            },
            author_posts: function(callback) {
                // finds blog entries that are tied to the author and sets author parameter to author id in template
                BlogEntry.find(
                    {
                        'author': req.body.authorid,
                    }
                ).exec(callback)
            }
        }, function(err, results) {
            if(err) {
                return next(err);
            }
            // if author has posts, re render the delete page
            if(results.author_posts.length > 0) {
                res.render('author_delete', {title: 'Delete Author', author: results.author, author_posts: results.author_posts})
            } else {
                // if author does not have posts remove the author
                Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                    if(err) { return next(err) }
                    res.redirect('/blog/authors')
                })
            }
        }
    )
}

// Update Functions

exports.author_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Author Update GET');
}

exports.author_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Author Update POST');
}