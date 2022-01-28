const express         = require("express")
const router          = express.Router()
const flash           = require('connect-flash')
const bcrypt          = require("bcrypt")
const mySqlConnection = require("../db/db")

let user

router.get("/register", (req, res) => {
    if (!req.session.user) {
        res.status(200).render('register')
    } else {
        res.status(401).send("Вы уже вошли в систему")
    }
});

router.get("/login", (req, res) => {
    if (!req.session.user) {
        res.status(200).render("login", {message: req.flash('registerMsg')})
    } else {
        res.redirect('/')
    }
});

router.get('/newblog', (req, res) => {
    if (!req.session.user) {
        res.status(200).redirect("/users/login")
    } else {
        res.status(401).render('newBlog')
    }
});


router.post("/register", (req, res) => {
    const { name, email, password, password2, phone } = req.body
    let errors = []
    
    if (!name || !email || !password || !password2 || !phone) {
        
    }
    if (password != password2) {
        errors.push('Пароли не совпадают')
    }
    if (password.length < 6) {
        errors.push('Пароль должен содержать не менее 6 символов')
    }
    
    mySqlConnection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, rows) => {
            if (err) res.status(500).send(err)
            else if (rows.length) errors.push({ msg: "Пользователь с данным Email уже зарегистрирован" })
            else if (errors.length > 0) {
            res.statusCode = 400
            res.send(errors)
        } else {
            pwdHash = bcrypt.hashSync(password, 10)
            var sql = 'INSERT INTO users (name, email, phone, pwdHash) VALUES ?'
            const values = [[name, email, phone, pwdHash]]
            mySqlConnection.query(sql, [values], function(err) {
                if (err) res.status(500).send(err);
                else {
                    req.flash('registerMsg', "Регистрация выполнена успешно")
                    res.status(200).redirect("/users/login")
                }
            });
        }
    }
    );
});

router.post("/login", (req, res) => {
    const { email, password } = req.body
    mySqlConnection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, rows) => {
            if (err) res.status(500).send(err)
            user = rows[0]
            if (user) {
                const result = bcrypt.compareSync(password, user.pwdHash)
                if (result) {
                    req.session.user = user
                    req.flash('welcome', "Добро пожаловать, " + req.session.user.name)
                    res.status(200).redirect('../dashboard')
                } else {
                    res.status(400).send("Неверный пароль")
                }
            } else {
                res.status(400).send("Пользователь с данным Email не найден")
            }
        },
    )
});
    
router.post('/newblog', (req, res) => {  
    const { title, img, text, category } = req.body
    const email = user.email
    let errors = []

    if (!title || !text || !category) {
        errors.push({msg: "Заполните все поля"})
    }
    var today = new Date();
    var date = today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear()
    const sqlQuery = "INSERT INTO blogs (title, dateofPublish, author, category, blogText, likes, imgURL, userEmail) VALUES ?";
    const values2 = [[title, date, user.name, category, text, 0, img, email]]
    mySqlConnection.query(sqlQuery, [values2], function(err) {
        if (err) res.status(500).send(err);
        else {
            req.flash('newBlogMsg', "Пост создан успешно!")
            res.status(200).redirect("/dashboard")
        }
    });
});

module.exports = router