const mongoose = require('mongoose');
const Task = require('./model/task.js');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyparser = require('body-parser');
const { check, validationResult } = require('express-validator');


const app = express()

// To read req.body
app.use(bodyparser.urlencoded({
    extended: true
}));

// Set up Template Engine and View
app.engine('ejs', exphbs({ extname: 'ejs', defaultLayout: 'index', layoutsDir: __dirname + '/views/'}))
// app.engine('hbs', exphbs({ extname: 'hbs' }))
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');


// Connect to MongoDb and start server
const dbURI = 'mongodb+srv://erikato:1234@cluster0.kw2hx.mongodb.net/TasksDB?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        app.listen(3000)
        console.log("Connected to db");
    })
    .catch((err) => console.log(err))


// index.ejs bruges som template, så alle views får samme look. Derfor navigeres der direkte videre til '/list'
app.get('/', (req,res) => {
    res.redirect('/list')
})

// anvendes i list.ejs, når der klikkes på 'Create new task'
app.get('/addOrEdit', (req,res) => {
    res.render("addOrEdit", {
        viewTitle: "Insert Task"
    })
})



// anvendes til enten at oprette / opdatere en record. Først tjekkes om parametrene er gyldige 'check' (vha. mongoose)
app.post('/addOrEdit', [
        check('title', "No numbers").isString(),
        check('text', "Min 3 characters long").isLength({min: 3}),
        // check('time', "Has to be a datetime").isDate()
    ], (req,res) =>
    {
        // Fejl ved parametrene
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const alert = errors.array()
            let titleError = null;
            let textError = null;
            let timeError = null;

            // console.log("alert.param: "+alert[0].param)
            // TODO: Conditional statement in ejs and send 'alert' instead

            switch(alert[0].param){
                case 'title':
                    titleError = "Title Error"
                    break;
                case 'text':
                    textError = "Text Error"
                    break;
                case 'time':
                    timeError = "Time Error"
                    break;
                default:
                    break;
            }

            res.render('addOrEdit', {
               titleError: titleError,
               textError: textError,
               timeError: timeError
            })
            return;
        }

        // ingen fejl ved parametrene. create / update

        if(req.body._id == ''){
            insertRecord(req,res)
        }else{
            updateRecord(req,res)
        }
    })


function insertRecord(req,res){
    const task = new Task();
    task.title = req.body.title;
    task.text = req.body.text;
    task.time = req.body.time;

    task.save((err,doc) => {
        if(!err){
            console.log("Record saved")
            res.redirect('/list');
        }
        else{
            console.log("Error in saving record: "+err)
        }
    })
}

// To solve 'updateRecord' deprecate warning
mongoose.set('useFindAndModify', false);

function updateRecord(req,res){
    Task.findOneAndUpdate({ _id: req.body._id }, req.body, {new: true}, (err, doc) => {
        if(!err) {
            console.log("Record updated")
            res.redirect('list')
        }else{
            console.log("Error in updating record: "+err)
        }
    })
}


app.get("/list", (req,res) => {
    Task.find((err,docs)=> {
        if(!err){
            res.render("list", {
                list: docs,
                viewTitle: "Task List"
            })
        }
        else{
            console.log('Error in retrieving task list: '+err)
        }
    }).lean()
})


app.get('/update/:id', (req,res) => {
    Task.findById(req.params.id, (err, doc) => {
        // TODO: send 'doc' and read properties in 'addOrEdit.ejs' instead of splitting up
        if(!err){
            // Passing data to addOrEdit.js and retrieve data in app.post(/addOrEdit,...)
            res.render("addOrEdit",{
                viewTitle: "Update Task",
                _id: doc._id,
                title: doc.title,
                text: doc.text,
                time: doc.time
            })
        }
    })
})


app.get('/delete/:id', (req,res) => {
    Task.findByIdAndRemove(req.params.id, (err, doc) => {
        if(!err){
            res.redirect('/list')
        }else{
            console.log
        }
    })
})









