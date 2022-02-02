var express          = require("express"),
    methodOverride   = require("method-override"),
    bodyParser       = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    app              = express(),
    flash            = require('connect-flash');

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressSanitizer())
app.use(methodOverride("_method"))
app.use(express.json())
app.use(flash())

const session = require('express-session')

app.use(session({
  secret: 'justshortkey',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }
}));

app.use('/', require('./routes/index.js'))

app.use('/users', require('./routes/users.js'))

app.get("*", (req, res) => {
    res.render('./errorpage')
});
var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("Server has started!")
});
