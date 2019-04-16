var db = require('../db/db');
var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', function(req, res, next) {
    db.getPublishers((errPublishers, publishers) => {
        if(!errPublishers){
            res.render('publishers', { title: 'Publishers', errors: "", publishers: publishers });
        }else{
            res.render('publishers', { title: 'Publishers', errors: "Error get publishers: " + errPublishers, publishers: [] });
        }
    });
});

router.get('/add', function(req, res, next) {
    res.render('addPublisher', { title: 'Add publisher', errors: "" });
});

router.post('/add', function(req, res, next) {
    if(req.body.name && req.body.address && req.body.phone){
        let name = req.body.name;
        let address = req.body.address;
        let phone = req.body.phone;
        db.addPublisher(name, address, phone, (errAddPublisher) => {
            if(errAddPublisher){
                res.render('addPublisher', { title: 'Add publisher', errors: "Errors add publisher: " + errAddHeading});
            }else{
                res.redirect('/publishers');
            }
        })
    }else{
        res.render('addPublisher', { title: 'Add publisher', errors: "Empty fields."});
    }
});

router.get('/update/:id', function(req, res, next) {
    if(req.params.id){
        db.getPublisher(req.params.id, (errPublisher, publisher) => {
            if(!errPublisher){
                if(publisher[0]){
                    res.render('updatePublisher', { title: 'Update publisher', errors: "", id: publisher[0].id, name: publisher[0].name, address: publisher[0].address, phone: publisher[0].phone});
                }else{
                    res.render('updatePublisher', { title: 'Update publisher', errors: "Not found publisher.", id: -1, name: "", address: "", phone: ""});
                }
            }else{
                res.render('updatePublisher', { title: 'Update publisher', errors: "Errors found publisher: " + errPublisher, id: -1, name: "", address: "", phone: ""});
            }
        });
    }else{
        res.render('updatePublisher', { title: 'Update publisher', errors: "Not found id publisher.", id: -1, name: "", address: "", phone: ""});
    }
});

router.post('/update/:id', function(req, res, next) {
    if(req.params.id){
        let id = req.params.id;
        if(req.body.name && req.body.address && req.body.phone){
            let name = req.body.name;
            let address = req.body.address;
            let phone = req.body.phone;
            db.updatePublisher(id, name, address, phone, (errUpdatePublisher) => {
                if(errUpdatePublisher){
                    res.render('updatePublisher', { title: 'Update publisher', errors: "Errors update: " + errUpdatePublisher, id: id, name: name, address: address, phone: phone});
                }else{
                    res.redirect('/publishers');
                }
            });
        }else{
            res.render('updatePublisher', { title: 'Update publisher', errors: "Empty name.", id: id, name: "", address: "", phone: ""});
        }
    }else{
        res.render('updatePublisher', { title: 'Update publisher', errors: "Not found id publisher.", id: -1, name: "", address: "", phone: ""});
    }
});

router.get('/delete/:id', function(req, res, next) {
    db.getPublishers((errPublishers, publishers) => {
        if(!errPublishers){
            if(req.params.id){
                db.getBooksByPublisher(req.params.id, (errBooks, books) => {
                    if(!errBooks) {
                        if(books.length==0){
                            db.deletePublisher(req.params.id, (errDeletePublisher) => {
                                if(errDeletePublisher){
                                    console.error("Error delete publisher: " + errDeletePublisher);
                                }else{
                                    res.redirect('/publishers');
                                }
                            });
                        }else{
                            res.render('publishers', { title: 'Publishers', errors: "You can not delete the publisher that is used.", publishers: publishers });
                        }
                    }else{
                        console.error("Error get books of publisher: " + errBooks);
                    }
                });
            }
        }else{
            res.render('publishers', { title: 'Publishers', errors: "Error get publishers: " + errPublishers, publishers: [] });
        }
    });
});

module.exports = router;
