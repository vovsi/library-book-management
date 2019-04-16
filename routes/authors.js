var db = require('../db/db');
var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', function(req, res, next) {
    db.getAuthors((errAuthors, authors) => {
        if(!errAuthors){
            res.render('authors', { title: 'Authors', errors: "", authors: authors });
        }else{
            res.render('authors', { title: 'Authors', errors: "Error get authors: " + errAuthors, authors: [] });
        }
    });
});

router.get('/add', function(req, res, next) {
    res.render('addAuthor', { title: 'Add author', errors: ""});
});

router.post('/add', function(req, res, next) {
    if(req.body.firstName && req.body.lastName && req.body.middleName){
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let middleName = req.body.middleName;
        db.addAuthor(firstName, lastName, middleName, (errAddAuthor) => {
            if(errAddAuthor){
                res.render('addAuthor', { title: 'Add author', errors: "Errors add: " + errAddAuthor});
            }else{
                res.redirect('/authors');
            }
        });
    }else{
        res.render('addAuthor', { title: 'Add author', errors: "Empty fileds."});
    }
});

router.get('/update/:id', function(req, res, next) {
    if(req.params.id){
        db.getAuthor(req.params.id, (errAuthor, author) => {
            if(!errAuthor){
                if(author[0]){
                    res.render('updateAuthor', { title: 'Update author', errors: "", id: author[0].id, firstName: author[0].first_name, lastName:author[0].last_name, middleName: author[0].middle_name});
                }else{
                    res.render('updateAuthor', { title: 'Update author', errors: "Not found author.", id: -1, firstName: "", lastName: "", middleName: ""});
                }
            }else{
                res.render('updateAuthor', { title: 'Update author', errors: "Errors found author: " + errAuthor, id: -1, firstName: "", lastName: "", middleName: ""});
            }
        });
    }else{
        res.render('updateAuthor', { title: 'Update author', errors: "Not found id author.", id: -1, firstName: "", lastName: "", middleName: ""});
    }
});

router.post('/update/:id', function(req, res, next) {
    if(req.params.id){
        let id = req.params.id;
        if(req.body.firstName && req.body.lastName && req.body.middleName){
            let firstName = req.body.firstName;
            let lastName = req.body.lastName;
            let middleName = req.body.middleName;
            db.updateAuthor(id, firstName, lastName, middleName, (errUpdateAuthor) => {
                if(errUpdateAuthor){
                    res.render('updateAuthor', { title: 'Update author', errors: "Errors update: " + errUpdateAuthor, id: id, firstName: firstName, lastName: lastName, middleName: middleName});
                }else{
                    res.redirect('/authors');
                }
            });
        }else{
            res.render('updateAuthor', { title: 'Update author', errors: "Empty fields.", id: id, firstName: "", lastName: "", middleName: ""});
        }
    }else{
        res.render('updateAuthor', { title: 'Update author', errors: "Not found id author.", id: -1, firstName: "", lastName: "", middleName: ""});
    }
});

router.get('/delete/:id', function(req, res, next) {
    if(req.params.id){
        db.deleteAuthor(req.params.id, (errDeleteAuthor) => {
            if(errDeleteAuthor){
                res.redirect('/authors');
            }else{
                res.redirect('/authors');
            }
        });
    }else{
        res.redirect('/authors');
    }
});

module.exports = router;
