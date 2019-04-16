var db = require('../db/db');
var bodyParser = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: 'tmp/' })
var fs = require('fs');
var express = require('express');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', function(req, res, next) {
  db.getBooks((errBooks, books) => {
    if(!errBooks){
        res.render('index', { title: 'Books', errors: "", books: books });
    }else{
        res.render('index', { title: 'Books', errors: "Error get books: " + errBooks, books: [] });
    }
  });
});

router.get(/^\/(\d+)$/, function(req, res, next) {
  if(req.params[0]){
    db.getBook(req.params[0], (errBook, book) => {
      if(!errBook){
          db.getHeading(book[0].heading_id, (errHeading, heading) => {
            if(!errHeading){
              if(heading){
                db.getPublisher(book[0].publisher_id, (errPublisher, publisher) => {
                  if(!errPublisher){
                    if(publisher[0]){
                      db.getIAuthorsOfBook(book[0].id, (errAuthors, authors) => {
                        if(!errAuthors){
                          if(authors){
                            db.getIImagesOfBook(book[0].id, (errImages, images) => {
                              if(!errImages){
                                if(images){
                                  res.render('detailsBook', { title: 'Book', errors: "", name: book[0].name, datePublishing: book[0].date_publishing, heading: heading[0].name, authors: authors, images: images, publisher: publisher[0] });
                                }else{
                                  res.render('detailsBook', { title: 'Book', errors: "Images not found.", name: book[0].name, datePublishing: book[0].date_publishing, heading: heading[0].name, authors: authors, images: [], publisher: publisher[0] });
                                }
                              }else{
                                res.render('detailsBook', { title: 'Book', errors: "Errors get images: " + errImages, name: book[0].name, datePublishing: book[0].date_publishing, heading: heading[0].name, authors: authors, images: [], publisher: publisher[0] });
                              }
                            });
                          }else{
                            res.render('detailsBook', { title: 'Book', errors: "Authors not found.", name: book[0].name, datePublishing: book[0].date_publishing, heading: heading[0].name, authors: [], images: [], publisher: publisher[0] });
                          }
                        }else{
                          res.render('detailsBook', { title: 'Book', errors: "Errors get authors: " + errAuthors, name: book[0].name, datePublishing: book[0].date_publishing, heading: heading[0].name, authors: [], images: [], publisher: publisher[0] });
                        }
                      });
                    }else{
                      res.render('detailsBook', { title: 'Book', errors: "Not found publisher.", name: book[0].name, datePublishing: book[0].date_publishing, heading: "", authors: [], images: [], publisher: "" });
                    }
                  }else{
                    res.render('detailsBook', { title: 'Book', errors: "Errors get publisher: " + errPublisher, name: book[0].name, datePublishing: book[0].date_publishing, heading: "", authors: [], images: [], publisher: "" });
                  }
                });
              }else{
                res.render('detailsBook', { title: 'Book', errors: "Not found heading.", name: book[0].name, datePublishing: book[0].date_publishing, heading: "", authors: [], images: [], publisher: "" });
              }
            }else{
              res.render('detailsBook', { title: 'Book', errors: "Errors get heading: " + errHeading, name: book[0].name, datePublishing: book[0].date_publishing, heading: "", authors: [], images: [], publisher: "" });
            }
          });
      }else{
          res.render('detailsBook', { title: 'Book', errors: "Error get book: " + errBook, name: "", datePublishing: "", heading: "", authors: [], images: [], publisher: "" });
      }
    });
  }else{
    res.redirect('/');
  }
});

router.get('/add', function(req, res, next) {
  db.getPublishers((errPublishers, publishers) => {
    if(!errPublishers){
      db.getHeadings((errHeadings, headings) => {
        if(!errHeadings){
            if(headings){
                db.getAuthors((errAuthors, authors) => {
                  if(!errAuthors){
                    if(authors){
                      res.render('addBook', { title: 'Add book', errors: "", headings: headings, authors: authors, publishers: publishers });
                    }else{
                      res.render('addBook', { title: 'Add book', errors: "Not found authors.", headings: headings, authors: [], publishers: publishers });
                    }
                  }else{
                    res.render('addBook', { title: 'Add book', errors: "Errors found authors: " + errAuthors, headings: headings, authors: [], publishers: publishers });
                  }
                });
            }else{
                res.render('addBook', { title: 'Add book', errors: "Not found headings", headings: [], authors: [], publishers: publishers });
            }   
        }else{
            res.render('addBook', { title: 'Add book', errors: "Errors found headings: " + errHeadings, headings: [], authors: [], publishers: publishers });
        }
      });
    }else{
      res.render('addBook', { title: 'Add book', errors: "Errors found publishers: " + errPublishers, headings: [], authors: [], publishers: [] });
    }
  });
});

router.post('/add', upload.array('images', 10), function(req, res, next) {
  db.getPublishers((errPublishers, publishers) => {
    if(!errPublishers){
      db.getHeadings((errHeadings, headings) => {
        if(!errHeadings){
            if(headings){
                db.getAuthors((errAuthors, authors) => {
                  if(!errAuthors){
                    if(authors){
    
                      if(req.body.publisher, req.body.name && req.body.datePublishing && req.body.heading && req.body.authors && req.files.length>0){
                        if(new Date(req.body.datePublishing)<=new Date()){
                          
                          db.addBook(req.body.name, req.body.datePublishing, req.body.publisher, req.body.heading, (errAddBook, addBook) => {
                            if(!errAddBook){
                              // Add images
                              for(let file of req.files){
                                var img = fs.readFileSync(file.path);
                                var encode_image = 'data:image/jpeg;base64,'+img.toString('base64');
                                  db.addPhoto(encode_image, (errAddPhoto, addPhoto) => {
                                    if(!errAddPhoto){
                                      if(addPhoto){
                                        db.addIBookPhoto(addBook.insertId, addPhoto.insertId, (errAddIBookPhoto) => {
                                          if(errAddIBookPhoto){
                                            console.log("Errors add IBookPhoto: " + errAddIBookPhoto);
                                          }
                                        });
                                      }else{
                                        console.log("Not found photo.");
                                      }
                                    }else{
                                      console.log("Error add photo: " + errAddPhoto);
                                    }
                                    fs.unlinkSync(file.path);
                                  });
                              }
                              // Add authors
                              for(let author of req.body.authors){
                                db.addIBookAuthor(addBook.insertId, author, (errAddIBookAuthor) => {
                                  if(errAddIBookAuthor){
                                    console.error("Error add i book author: " + errAddIBookAuthor);
                                  }
                                });
                              }
                              res.redirect('/');
                            }else{
                              res.render('addBook', { title: 'Add book', errors: "Error add book: " + errAddBook, headings: headings, authors: authors, publishers: publishers });
                            }
                          });
    
                        }else{
                          res.render('addBook', { title: 'Add book', errors: "Date most be > then current date.", headings: headings, authors: authors, publishers: publishers });
                        }
                      }else{
                        res.render('addBook', { title: 'Add book', errors: "Empty fields.", headings: headings, authors: authors, publishers: publishers });
                      }
    
                    }else{
                      res.render('addBook', { title: 'Add book', errors: "Not found authors.", headings: headings, authors: [], publishers: publishers });
                    }
                  }else{
                    res.render('addBook', { title: 'Add book', errors: "Errors found authors: " + errAuthors, headings: headings, authors: [], publishers: publishers });
                  }
                });
            }else{
                res.render('addBook', { title: 'Add book', errors: "Not found headings", headings: [], authors: [], publishers: publishers });
            }   
        }else{
            res.render('addBook', { title: 'Add book', errors: "Errors found headings: " + errHeadings, headings: [], authors: [], publishers: publishers });
        }
      });
    }else{
      res.render('addBook', { title: 'Add book', errors: "Errors found publishers: " + errPublishers, headings: [], authors: [], publishers: [] });
    }
  });
});

router.get('/update/:id', function(req, res, next) {
  db.getPublishers((errPublishers, publishers) => {
    if(!errPublishers){
      db.getHeadings((errHeadings, headings) => {
        if(!errHeadings){
            if(headings){
                db.getAuthors((errAuthors, authors) => {
                  if(!errAuthors){
                    if(authors){
                      
                      if(req.params.id){
                        db.getBook(req.params.id, (errBook, book) => {
                            if(!errBook){
                                if(book[0]){
                                  db.getHeading(book[0].heading_id, (errHeading, heading) => {
                                    if(!errHeading){
                                      if(heading[0]){
                                        db.getIAuthorsOfBook(book[0].id, (errMyAuthors, myAuthors) => {
                                          if(!errMyAuthors){
                                            db.getIImagesOfBook(book[0].id, (errMyImages, myImages) => {
                                              if(!errMyImages) {
                                                res.render('updateBook', { title: 'Update book', errors: "", id: book[0].id, name: book[0].name, datePublishing: getDateFormat(book[0].date_publishing), headings: headings, myHeading: heading[0].name, authors: authors, myAuthors: myAuthors, myImages: myImages, publishers: publishers, myPublisher: book[0].publisher_id });
                                              }else{
                                                res.render('updateBook', { title: 'Update book', errors: "Errors get images: " + errMyImages, id: book[0].id, name: book[0].name, datePublishing: getDateFormat(book[0].date_publishing), headings: headings, myHeading: heading[0].name, authors: authors, myAuthors: myAuthors, myImages: [], publishers: publishers, myPublisher: book[0].publisher_id });
                                              }
                                            });
                                          }else{
                                            res.render('updateBook', { title: 'Update book', errors: "Errors find my authors: " + errMyAuthors, id: book[0].id, name: book[0].name, datePublishing: book[0].date_publishing, headings: headings, myHeading: heading[0].name, authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: book[0].publisher_id });
                                          }
                                        });
                                      }else{
                                        res.render('updateBook', { title: 'Update book', errors: "Not find heading. ", name: book[0].id, name: book[0].name, datePublishing: book[0].date_publishing, headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: book[0].publisher_id });
                                      }
                                    }else{
                                      res.render('updateBook', { title: 'Update book', errors: "Errors get heading: " + errHeading, id: book[0].id, name: book[0].name, datePublishing: book[0].date_publishing, headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: book[0].publisher_id });
                                    }
                                  });
                                }else{
                                    res.render('updateBook', { title: 'Update book', errors: "Not found book.", id: -1, name: "", datePublishing: "", headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                                }
                            }else{
                                res.render('updateBook', { title: 'Update book', errors: "Errors found book: " + errBook, id: -1, name: "", datePublishing: "", headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                            }
                        });
                      }else{
                          res.render('updateBook', { title: 'Update book', errors: "Not found id book.", id: -1, name: "", datePublishing: "", headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                      }
    
                    }else{
                      res.render('updateBook', { title: 'Update book', errors: "Not found authors.", id: -1, name: "", datePublishing: "", headings: headings, myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                    }
                  }else{
                    res.render('updateBook', { title: 'Update book', errors: "Errors found authors: " + errAuthors, id: -1, name: "", datePublishing: "", headings: headings, myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                  }
                });
            }else{
                res.render('updateBook', { title: 'Update book', errors: "Not found headings", id: -1, name: "", datePublishing: "", headings: [], myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
            }   
        }else{
            res.render('updateBook', { title: 'Update book', errors: "Errors found headings: " + errHeadings, id: -1, name: "", datePublishing: "", headings: [], myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
        }
      });
    }else{
      res.render('updateBook', { title: 'Update book', errors: "Errors found publishers: " + errPublishers, id: -1, name: "", datePublishing: "", headings: [], myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: [], myPublisher: "" });
    }
  });
});

router.post('/update/:id', upload.array('images', 10), function(req, res, next) {
  db.getPublishers((errPublishers, publishers) => {
    if(!errPublishers){
      db.getHeadings((errHeadings, headings) => {
        if(!errHeadings){
            if(headings){
                db.getAuthors((errAuthors, authors) => {
                  if(!errAuthors){
                    if(authors){
                      
                      if(req.params.id){
                        db.getBook(req.params.id, (errBook, book) => {
                            if(!errBook){
                                if(book[0]){
                                  if(req.body.publisher && req.body.name && req.body.datePublishing && req.body.heading && req.body.authors){
                                      let nameBody = req.body.name;
                                      let datePublishingBody = req.body.datePublishing;
                                      let publisherIdBody = req.body.publisher;
                                      let headingIdBody = req.body.heading;
                                      let authorsBody = req.body.authors;
                                      let isSaveOldImages = req.body.isSaveOldImages;
    
                                      if(new Date(datePublishingBody)<=new Date()){
                                        // If user not want save old images
                                        let errorsImages = "";
                                        if(!isSaveOldImages){
                                          if(req.files.length>0){
                                            // Delete old images
                                            db.getIBookPhotosOfBook(book[0].id, (errIBookPhotos, iBookPhotos) => {
                                              if(!errIBookPhotos){
                                                for(let bookPhoto of iBookPhotos){
                                                  db.deleteIBookPhotos(bookPhoto.id, (errDeleteBookPhoto) => {
                                                    if(errDeleteBookPhoto){
                                                      console.error("Errors delete i book photo: " + errDeleteBookPhoto);
                                                    }else{
                                                      db.deletePhoto(bookPhoto.photo_id, (errDeletePhoto) => {
                                                        if(errDeletePhoto){
                                                          console.error("Errors delete photo: " + errDeletePhoto);
                                                        }
                                                      });
                                                    }
                                                  });
                                                }
                                              }else{
                                                console.error("Errors get i book photos: " + errIBookPhotos);
                                              }
                                            });
    
                                            // Load new images
                                            for(let file of req.files){
                                              var img = fs.readFileSync(file.path);
                                              var encode_image = 'data:image/jpeg;base64,'+img.toString('base64');
                                                db.addPhoto(encode_image, (errAddPhoto, addPhoto) => {
                                                  if(!errAddPhoto){
                                                    if(addPhoto){
                                                      db.addIBookPhoto(book[0].id, addPhoto.insertId, (errAddIBookPhoto) => {
                                                        if(errAddIBookPhoto){
                                                          console.log("Errors add IBookPhoto: " + errAddIBookPhoto);
                                                        }
                                                      });
                                                    }else{
                                                      console.log("Not found photo.");
                                                    }
                                                  }else{
                                                    console.log("Error add photo: " + errAddPhoto);
                                                  }
                                                  fs.unlinkSync(file.path);
                                                });
                                            }
                                          }else{
                                            errorsImages = "No selected image.";
                                          }
                                        }
    
                                        if(!errorsImages){
                                          // Delete are authors of book
                                          db.deleteIBookAuthorOfBook(book[0].id, (errDeleteAuthorsOfBook) =>{
                                            if(errDeleteAuthorsOfBook){
                                              console.error("Errors delete are authors of book: " + errDeleteAuthorsOfBook);
                                            }
                                          });
    
                                          // Add new authors of book
                                          for(let authorS of authorsBody){
                                            db.addIBookAuthor(book[0].id, authorS, (errAddAuthor) => {
                                              if(errAddAuthor){
                                                console.error("Errors add are authors of book: " + errAddAuthor);
                                              }
                                            });
                                          }
    
                                          db.updateBook(book[0].id, nameBody, datePublishingBody, publisherIdBody, headingIdBody, (errUpdateBook) => {
                                            if(errUpdateBook){
                                              res.render('updateBook', { title: 'Update book', errors: "Errors update book: " + errUpdateBook, id: req.params.id, name: "", datePublishing: datePublishingBody, headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: publisherIdBody });
                                            }else{
                                              res.redirect('/');
                                            }
                                          });
                                        }else{
                                          res.redirect('/update/' + req.params.id);
                                        }
                                      }else{
                                        res.render('updateBook', { title: 'Update book', errors: "Date publishing must be > current. ", id: req.params.id, name: "", datePublishing: datePublishingBody, headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: publisherIdBody });
                                      }
                                    }else{
                                      res.render('updateBook', { title: 'Update book', errors: "Empty fields.", id: req.params.id, name: "", datePublishing: "", headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: book[0].publisher_id });
                                    }
                                }else{
                                    res.render('updateBook', { title: 'Update book', errors: "Not found book.", id: req.params.id, name: "", datePublishing: "", headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                                }
                            }else{
                                res.render('updateBook', { title: 'Update book', errors: "Errors found book: " + errBook, id: req.params.id, name: "", datePublishing: "", headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                            }
                        });
                      }else{
                          res.render('updateBook', { title: 'Update book', errors: "Not found id book.", id: req.params.id, name: "", datePublishing: "", headings: headings, myHeading: "", authors: authors, myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                      }
    
                    }else{
                      res.render('updateBook', { title: 'Update book', errors: "Not found authors.", id: -1, name: "", datePublishing: "", headings: headings, myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                    }
                  }else{
                    res.render('updateBook', { title: 'Update book', errors: "Errors found authors: " + errAuthors, id: -1, name: "", datePublishing: "", headings: headings, myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
                  }
                });
            }else{
                res.render('updateBook', { title: 'Update book', errors: "Not found headings", id: -1, name: "", datePublishing: "", headings: [], myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
            }   
        }else{
            res.render('updateBook', { title: 'Update book', errors: "Errors found headings: " + errHeadings, id: -1, name: "", datePublishing: "", headings: [], myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: publishers, myPublisher: "" });
        }
      });
    }else{
      res.render('updateBook', { title: 'Update book', errors: "Errors found publishers: " + errPublishers, id: -1, name: "", datePublishing: "", headings: [], myHeading: "", authors: [], myAuthors: [], myImages: [], publishers: [], myPublisher: "" });
    }
  });
});

router.get('/delete/:id', function(req, res, next) {
  if(req.params.id){
    db.getIBookPhotosOfBook(req.params.id, (errIBookPhotos, iBookPhotos) => {
      if(!errIBookPhotos){
        db.deleteIBookAuthorOfBook(req.params.id, (errDeleteIBookAuthor) => {
          if(!errDeleteIBookAuthor){
            for(let bookPhoto of iBookPhotos) {
              db.deleteIBookPhotos(bookPhoto.id, (errDeleteIBookPhoto) => {
                if(errDeleteIBookPhoto){
                  console.error("Error delete i book photo: " + errDeleteIBookPhoto);
                }else{
                  db.deletePhoto(bookPhoto.photo_id, (errDeletePhoto) => {
                    if(errDeletePhoto){
                      console.error("Error delete photo: " + errDeletePhoto);
                    }else{
                      // Good End
                    }
                  });
                }
              });
            }
          }else{
            console.error("Error delete i book authors: " + errDeleteIBookAuthor);
          }
        });
      }else{
        console.error("Error get i book photos: " + errIBookPhotos);
      }
    });
    db.deleteBook(req.params.id, (errDeleteBook) => {
      if(!errDeleteBook){
        // All good. Book deletted
      }else{
        console.error("Error delete book: " + errDeleteBook);
      }
    });
  }
  res.redirect('/');
});

// Get date in format to html input date
function getDateFormat(myDate) {
  var day, month, year, date;
  day = myDate.getDate();
  if (day <10)
    day = "0" + day;
  month = myDate.getMonth() + 1;
  if (month < 10)
    month = "0" + month;
  year = myDate.getFullYear();
  date = year + "-" + month + "-" + day;
  return date;
}

module.exports = router;
