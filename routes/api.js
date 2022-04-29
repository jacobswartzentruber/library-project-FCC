'use strict';

module.exports = function (app) {

  const Book = require('../models/book');

  app.route('/api/books')
    .get(function (req, res){
      Book.find({}, (err, books) => {
        if(err) return res.send('error finding books');
        
        let resObj = books.map(book =>
          ({
            _id: book._id,
            title: book.title,
            commentcount: book.comments.length
          })
        );

        res.json(resObj);
      });
    })
    
    .post(function (req, res){
      let title = req.body.title;

      if(!title) return res.send('missing required field title');

      let book = new Book({
        title: title
      });

      book.save((err, data) => {
        if(err) return res.json({error: 'error saving book'});

        res.json(data);
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, data) => {
        if(err) return res.send('error finding books');

        res.send('complete delete successful');
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;

      Book.findById(bookid, (err, book) => {
        if(err) return res.send('error finding books');

        if(!book) return res.send('no book exists');

        res.json(book);
      });
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      if(!comment) return res.send('missing required field comment');

      Book.findById(bookid, (err, book) => {
        if(err) return res.send('error finding book');

        if(!book) return res.send('no book exists');

        book.comments.push(comment);

        book.save((err, data) => {
          if(err) return res.json({error: 'error saving book'});
  
          res.json(data);
        })
      });
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;

      Book.findByIdAndDelete(bookid, (err, book) => {
        if(err) return res.send('error finding book');

        if(!book) return res.send('no book exists');

        res.send('delete successful');
      });
    });
  
};
