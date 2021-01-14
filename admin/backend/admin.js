const dotenv = require('dotenv');
const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const SessionRouter = require('./SessionRouter');
const ProductsRouter = require('./ProductsRouter');
const UsersRouter = require('./UsersRouter');
const utils = require('./Utils');
const dbManagement = require('./DBManagement');


const PORT = 5000;


const {CONSOLE_RED, CONSOLE_YELLOW, CONSOLE_GREEN} = utils;

const result = dotenv.config();
if (result.error) {
    utils.printMessage(CONSOLE_RED, ' SERVER ', 'DOTENV ERROR', result.error, 'reading .config()');
    throw result.error;
}

app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());

const auth = require('./Auth')

const YEAR_IN_MS = (1000 * 86400 * 365);

// Database
const db = mysql.createConnection({
    host: process.env.REACT_APP_DB_HOST,
    port: process.env.REACT_APP_DB_PORT,
    user: process.env.REACT_APP_DB_USER,
    password: process.env.REACT_APP_DB_PASSWORD,
    database: process.env.REACT_APP_DB_DATABASE,
    dateStrings: true,
    multipleStatements: true
});

db.connect(function(err) {
    if (err)
    {
        utils.printMessage(CONSOLE_RED, ' SERVER ', 'MYSQL ERROR', err, 'connecting');
        throw err;
    }
});

const sessionStore = new MySQLStore({
    epiration: YEAR_IN_MS,
    endConnectionOnCLose: false,
}, db);

app.use(session({
    key: 'userID',
    secret: process.env.REACT_APP_SESSION_SECRET,  // Keep secret
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: YEAR_IN_MS,
        httpOnly: false,
    }
}));

new SessionRouter(app, db);
new ProductsRouter(app, db);
new UsersRouter(app, db);

app.get('/api/users', auth.userAuthorised, function(req, res) {
    let query, cols = [];

    let {username, similar, privileges} = req.query;

    query = 'SELECT username, privileges FROM users';

    if (! username) {

        username = '';
        if (privileges !== undefined) {
            query = query + ` WHERE privileges >= ?`;
            cols.push(privileges);
        }

    } else {

        query = query + ' WHERE username';
        username = username.trim().toLowerCase();
        
        if (similar) {
            query = query + ` LIKE ?`;
            cols.push(username + '%');
        } else {
            query = query + ` = ?`;
            cols.push(username);
        }
        
        if (privileges !== undefined) {
            query = query + ` AND privileges >= ?`;
            cols.push(privileges);
        }
    }

    //query = dbManagement.limitQueryByPrivileges(query, cols, req.session.userID, auth.PRIVILIGES_ADMIN);

    queryReq =  {
        string: username, 
        similar,
        privileges,
    },
    dbManagement.getUsers(query, cols, queryReq, db, res);
})

app.get('/api/products', auth.userAuthenticated, function(req, res) {
    let query, cols = [];

    let {id, similar} = req.query;

    if (! id) {
        query = 'SELECT * FROM products';
    } else {

        if (similar) {
            query = `SELECT * FROM products WHERE id LIKE ?`;
            cols.push(id + '%');
        } else {
            query = `SELECT * FROM products WHERE id = ?`;
            cols.push(id);
        }
    }

    query = query + ' ORDER BY id DESC';
    
    const queryReq = {
        string: id,
        similar,
    }
    dbManagement.getProducts(query, cols, queryReq, db, res);
});

app.get('/api/mylogs', auth.userAuthenticated, function(req, res) {
    const query = 'SELECT * FROM products_logs WHERE user_id = ? ORDER BY date DESC';
    const cols = [req.session.userID];
    dbManagement.getLogs(query, cols, null, db, res);
})

app.get('/api/logs', auth.userAuthorised, function(req, res) {
    let query, cols = [];
    
    let {username, similar} = req.query;  // part_name?

    if (! username) {
        query = 'SELECT * FROM products_logs';
    } else {

        username = username.trim().toLowerCase();

        if (similar) {
            query = `SELECT * FROM products_logs WHERE user_username LIKE ?`;
            cols.push(username + '%');
        } else {
            query = `SELECT * FROM products_logs WHERE user_username = ?`;
            cols.push(username);
        }
    }

    //query = dbManagement.limitQueryByPrivileges(query, cols, req.session.userID, auth.PRIVILIGES_ADMIN);

    query = query + ' ORDER BY date DESC';
    
    const queryReq = {
        string: username,
        similar,
    }
    dbManagement.getLogs(query, cols, queryReq, db, res);
});

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const server = app.listen(PORT, () => {
    utils.printMessage(CONSOLE_YELLOW, ' SERVER ', 'READY', `Listening on http://localhost:${PORT}`)
});

process.on('SIGINT', () => {
    console.log('')
    utils.printMessage(CONSOLE_YELLOW, ' SERVER ', 'SHUTDOWN', '[0] Received kill signal, shutting down...');

    sessionStore.close(() => {
        utils.printMessage(CONSOLE_YELLOW, ' SERVER ', 'SHUTDOWN', '[1] Closed MYSQL Session Store');

        db.end(() => {
            utils.printMessage(CONSOLE_YELLOW, ' SERVER ', 'SHUTDOWN', '[2] Connection with database ended');

            server.close(() => {
                utils.printMessage(CONSOLE_YELLOW, ' SERVER ', 'SHUTDOWN', '[3] Closed server successfully');

                process.exit(0);
            });
        });
    });

    setTimeout(() => {
        utils.printMessage(CONSOLE_RED, ' SERVER ', 'SHUTDOWN', 'Connections took too long to close, forced exit.');

        process.exit(1);
    }, 5000);
});