var express = require('express');
var router = express.Router();

// route file calls the functions from the controller file and tells the page the content to render when request is received

// import our controllers
var blogEntryController = require('../controllers/blogEntryController');
var authorController = require('../controllers/authorController');

/// blog entry routes ///
router.get('/', blogEntryController.blog_entry_index);

router.get('/blog_entry/create', blogEntryController.blog_entry_create_get);

router.post('/blog_entry/create', blogEntryController.blog_entry_create_post);

router.get('/blog_entry/:id/delete', blogEntryController.blog_entry_delete_get);

router.post('/blog_entry/:id/delete', blogEntryController.blog_entry_delete_post);

router.get('/blog_entry/:id/update', blogEntryController.blog_entry_update_get);

router.post('/blog_entry/:id/update', blogEntryController.blog_entry_update_post);

router.get('/blog_entry/:id', blogEntryController.blog_entry_detail);

router.get('/blog_entries/', blogEntryController.blog_entry_list);


/// Author Routes /// 

router.get('/author/create', authorController.author_create_get);

router.post('/author/create', authorController.author_create_post);

router.get('/author/:id/delete', authorController.author_delete_get);

router.post('/author/:id/delete', authorController.author_delete_post);

router.get('/author/:id/update', authorController.author_update_get);

router.post('/author/:id/update', authorController.author_update_post);

router.get('/author/:id', authorController.author_detail);

router.get('/authors/', authorController.author_list);

module.exports = router;