const mysql = require("mysql");

const mySqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blog_db",
    multipleStatements: true
});

mySqlConnection.connect(err => {
    if (err) console.log(err);
    else console.log("Database Connected!")
});

module.exports = mySqlConnection