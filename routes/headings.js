var db = require('../db/db');
var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', function(req, res, next) {
    if(req.query.id){
        db.getHeadingsByParentId(req.query.id, (errHeadings, headings) => {
            if(!errHeadings){
                res.render('headings', { title: 'Headings', errors: "", headings: headings });
            }else{
                res.render('headings', { title: 'Headings', errors: "Error get headings: " + errHeadings, headings: [] });
            }
        });
    }else{
        db.getHeadingsWithoutParent((errHeadings, headings) => {
            if(!errHeadings){
                res.render('headings', { title: 'Headings', errors: "", headings: headings });
            }else{
                res.render('headings', { title: 'Headings', errors: "Error get headings: " + errHeadings, headings: [] });
            }
        });
    }
});

router.get('/add', function(req, res, next) {
    db.getHeadings((errHeadings, headings) => {
        if(!errHeadings){
            if(headings){
                res.render('addHeading', { title: 'Add heading', errors: "", headings: headings});
            }else{
                res.render('addHeading', { title: 'Add heading', errors: "Not found headings", headings: []});
            }   
        }else{
            res.render('addHeading', { title: 'Add heading', errors: "Errors found headings: " + errHeadings, headings: []});
        }
    });
});

router.post('/add', function(req, res, next) {
    db.getHeadings((errHeadings, headings) => {
        if(!errHeadings){
            if(headings){

                if(req.body.name && req.body.parentHeading){
                    let name = req.body.name;
                    let parentHeading = req.body.parentHeading;
                    if(parentHeading=='-'){
                        parentHeading = null;
                    }
                    db.addHeading(name, parentHeading, (errAddHeading) => {
                        if(errAddHeading){
                            res.render('addHeading', { title: 'Add heading', errors: "Errors add heading: " + errAddHeading, headings: headings});
                        }else{
                            res.redirect('/headings');
                        }
                    })
                }else{
                    res.render('addHeading', { title: 'Add heading', errors: "Empty fields.", headings: headings});
                }
            }else{
                res.render('addHeading', { title: 'Add heading', errors: "Not found headings", headings: []});
            }   
        }else{
            res.render('addHeading', { title: 'Add heading', errors: "Errors found headings: " + errHeadings, headings: []});
        }
    });
});

router.get('/update/:id', function(req, res, next) {
    if(req.params.id){
        db.getHeading(req.params.id, (errHeading, heading) => {
            if(!errHeading){
                if(heading[0]){
                    res.render('updateHeading', { title: 'Update heading', errors: "", id: heading[0].id, name: heading[0].name, parentHeadingId:heading[0].parent_heading_id});
                }else{
                    res.render('updateHeading', { title: 'Update heading', errors: "Not found author.", id: -1, name: "", parentHeading: ""});
                }
            }else{
                res.render('updateHeading', { title: 'Update heading', errors: "Errors found heading: " + errHeading, id: -1, name: "", parentHeading: ""});
            }
        });
    }else{
        res.render('updateHeading', { title: 'Update heading', errors: "Not found id author.", id: -1, name: "", parentHeading: ""});
    }
});

router.post('/update/:id', function(req, res, next) {
    if(req.params.id){
        let id = req.params.id;
        if(req.body.name){
            let name = req.body.name;
            let parentHeadingId = req.body.parentHeadingId;
            db.updateHeading(id, name, parentHeadingId, (errUpdateHeading) => {
                if(errUpdateHeading){
                    res.render('updateHeading', { title: 'Update heading', errors: "Errors update: " + errUpdateHeading, id: id, name: name, parentHeadingId: parentHeadingId});
                }else{
                    res.redirect('/headings');
                }
            });
        }else{
            res.render('updateHeading', { title: 'Update heading', errors: "Empty name.", id: id, name: "", parentHeadingId: ""});
        }
    }else{
        res.render('updateHeading', { title: 'Update heading', errors: "Not found id heading.", id: -1, name: "", parentHeadingId: ""});
    }
});

router.get('/delete/:id', function(req, res, next) {
    if(req.params.id){
        db.deleteHeading(req.params.id, (errDeleteHeading) => {
            if(errDeleteHeading){
                res.redirect('/headings');
            }else{
                res.redirect('/headings');
            }
        });
    }else{
        res.redirect('/headings');
    }
});

module.exports = router;
