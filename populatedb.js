#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = 'mongodb+srv://henrytran721:d@rkb1ad33r@cluster0-gevd4.azure.mongodb.net/blog_posts?retryWrites=true&w=majority';
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var BlogEntry = require('./models/blogentry')
var Author = require('./models/author')


var mongoose = require('mongoose');
var mongoDB = userArgs;
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var authors = [];
var blogentries = [];

function authorCreate(first_name, last_name, date_of_birth, cb) {
  var author = new Author({ first_name: first_name, last_name: last_name, date_of_birth:date_of_birth});
       
  author.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Author: ' + author);
    authors.push(author)
    cb(null, author);
  }   );
}

function entryCreate(title, description, imageURL, author, cb) {
  entrydetail = { 
    title:title,
    description: description,
    imageURL: imageURL,
    author: author,
  }
    
  var entry = new BlogEntry(entrydetail);    
  entry.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Entry: ' + entry);
    blogentries.push(entry)
    cb(null, entry)
  }  );
}

function createAuthors(cb) {
    async.series([
        function(callback) {
            authorCreate('Henry', 'Tran', '1997-07-21', callback);
        },
    ], cb)
}

function createEntries(cb) {
    async.series([
        function(callback) {
            entryCreate('NYC Fall 2019', 'testing database', 'https://cdn.vox-cdn.com/thumbor/M2rjDALxvNDv3yqeYuIdL3spabo=/0x0:2000x1333/1200x675/filters:focal(840x507:1160x827)/cdn.vox-cdn.com/uploads/chorus_image/image/65939918/171109_08_11_37_5DS_0545__1_.0.jpg', authors[0], callback);
        },
    ], cb)
}


async.series([
    createAuthors,
    createEntries
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



