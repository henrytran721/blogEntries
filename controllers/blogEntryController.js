// import blog entry model
var BlogEntry = require('../models/blogentry');
var Author = require('../models/author');
var async = require('async');

const { body,validationResult } = require('express-validator/');
const { sanitizeBody } = require('express-validator/');

exports.blog_entry_index = (req, res) => {
    async.parallel({
        blog_entry_count: function(callback) {
            BlogEntry.countDocuments({}, callback);
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        }
    }, 
        (err, results) => {
            res.render('index', {title: 'Henry\'s Blog', error: err, data: results})
        });
}
exports.blog_entry_list = (req, res, next) => {
    BlogEntry.find({}, 'title author date')
        .populate('author')
        .exec((err, list_entries) => {
            res.render('blog_list', {title: 'Blog List', blog_entry_list: list_entries})
        })
}


exports.blog_entry_detail = (req,res,next) => {
    async.parallel({
        // method to find individual object based on id
        blog_entry: function(callback) {
            // use Model method findById to filter objects based on id and check against request / url id
            BlogEntry.findById(req.params.id)
                // populate author data based on author model
                .populate('author')
                .exec(callback)
        },
    }, function(err, results) {
        // results parameter pulls in data received from previous methods ran by async.parallel
        if(err) {return next(err)};
        if(results.blog_entry == null) {
            var err = new Error('Blog Entry not found');
            err.status = 404;
            return next(err);
        }
        res.render('blog_entry_detail', {title: 'Blog Entry Detail', blog_entry: results.blog_entry, author: results.author})
    })
}

// Create Functions
exports.blog_entry_create_get = function(req, res, next) { 
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('blog_entry_form', { title: 'Create Blog Entry', authors: results.authors});
    });
};

exports.blog_entry_create_post = [
    body('title', 'New title is required').trim().isLength({min: 1}),
    body('description', 'Description is required to proceed').trim().isLength({min: 1}),
    body('author', 'Author is required').trim().isLength({min: 1}),
    body('imageURL').trim(),

    sanitizeBody('*').escape(),
    sanitizeBody('imageURL').unescape(),

    (req, res, next) => {
        
        // extracts validation errors from request
        const errors = validationResult(req);

        const blog_entry = new BlogEntry(
            {
                title: req.body.title,
                author: req.body.author,
                description: req.body.description,
                imageURL: req.body.imageURL,
            }
        )
        
        if(!errors.isEmpty()) {
            async.parallel({
                authors: function(callback) {
                    Author.find(callback)
                }
            }, function(err, results) {
                if(err) {
                    return next(err);
                }
                res.render('blog_entry_form', {title: 'Blog Entry Form', errors: errors.array(), author: results.author})
            }
            )
        } else {
            blog_entry.save(function(err) {
                if(err) {
                    return next(err);
                }
                res.redirect(blog_entry.url);
            })
        }
    }
];

// Delete Functions
exports.blog_entry_delete_get = (req, res, next) => {
    async.parallel(
        {
            // retrieve individual blog post entry based on id
            blog_entry: function(callback) {
                BlogEntry.findById(req.params.id)
                    .exec(callback)
            }
        }, function(err, results) {
            // results parameter pulls data from previous object
            if(err) {
                return next(err);
            }
            // if results.blog_entry is empty redirect user to list
            if(results.blog_entry === null) {
                res.redirect('/blog/blog_entries')
            }
            // render the delete template for user to satisfy their deletion
            res.render('blog_entry_delete', {title: 'Delete Blog Entry', blog_entry: results.blog_entry})
        }
    )
}

exports.blog_entry_delete_post = (req, res, next) => {
    async.parallel( 
        {
            blog_entry: function(callback) {
                // retrieves the blog entry by id parameter through the request object
                BlogEntry.findById(req.body.blog_entryid)
                    .exec(callback)
            }
        }, function(err, results) {
            if(err) {return next(err)}
            // call findbyidandremove method to remove based on blog_entryid located in template under name parameter
            BlogEntry.findByIdAndRemove(req.body.blog_entryid, function deleteEntry(err) {
                if(err) { return next(err) }
                res.redirect('/blog/blog_entries')
            })
        }
    )
}

// Update Functions

exports.blog_entry_update_get = (req, res, next) => {
    async.parallel(
        {
            blog_entry: function(callback) {
                BlogEntry.findById(req.params.id)
                    .populate('author')
                    .exec(callback)
            }, 
            authors: function(callback) {
                Author.find(callback);
            }
        }, function(err, results) {
            if(err) {return next(err)}
            if(results.blog_entry === null) {
                var err = new Error('Blog Entry not found');
                err.status = 404;
                return next(err);
            }
            res.render('blog_entry_form', {title: 'Update Blog Entry', authors: results.authors, blog_entry: results.blog_entry})
        }
    )
}

exports.blog_entry_update_post = [
    body('title', 'New title is required').trim().isLength({min: 1}),
    body('description', 'Description is required to proceed').trim().isLength({min: 1}),
    body('author', 'Author is required').trim().isLength({min: 1}),
    body('imageURL').trim(),

    sanitizeBody('*').escape(),
    sanitizeBody('imageURL').unescape(),

    (req, res, next) => {
        var errors = validationResult(req);
        
        var blog_entry = new BlogEntry(
            {
                title: req.body.title,
                description: req.body.description,
                author: req.body.author,
                imageURL: req.body.imageURL,
                // necessary or new id will be assigned
                _id:req.params.id
            }
        )

        if(!errors.isEmpty()) {
            async.parallel(
                {
                    blog_entry: function(callback) {
                        BlogEntry.findById(req.params.id)
                            .populate('author')
                            .exec(callback)
                    },
                    authors: function(callback) {
                        Author.find(callback)
                    },
                }, function(err, results) {
                    if(err) {
                        return next(err);
                    }
                    res.render('blog_entry_form', {title: 'Update Blog Entry', authors: results.authors, blog_entry: results.blog_entry});
                    return;
                }
            )
        } else {
            BlogEntry.findByIdAndUpdate(req.params.id, blog_entry, {}, function(err, theblogentry) {
                if(err) {return next(err)}
                res.redirect(theblogentry.url);
            })
        }
    }
]