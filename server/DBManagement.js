const { query } = require('express');
const utils = require('./Utils')

const {CONSOLE_RED, CONSOLE_YELLOW, CONSOLE_GREEN} = utils;

// Returns query and changes cols values
// const limitQueryByPrivileges = (query, cols, userID, minPrivileges) => {
//     if (cols.length === 0) {
//         query += ' WHERE';
//     } else {
//         query += ' AND';
//     }

//     query += ' EXISTS (SELECT username FROM users WHERE id = ? AND privileges >= ?)';
//     cols.push(userID);
//     cols.push(minPrivileges);

//     return query;
// }

const selectDB = (query, cols, queryReq, db, res, table) => {
    db.query(query, cols, (err, results) => {
        if (err) {
            utils.printMessage(CONSOLE_RED, table, 'MYSQL ERROR', err.code, 'selecting', query, cols);
            return res.json({
                successful: false,
                query: queryReq,
                error: err,
            })
        }

        if (!results || results.length === 0) {
            if (utils.PRINT_DEBUG_ERRORS_SOFT) {
                utils.printMessage(CONSOLE_YELLOW, table, 'ERROR', "No matching entries exist", 'selecting');
            }
            return res.json({
                successful: false,
                query: queryReq,
            });
        }

        if (utils.PRINT_DEBUG_SUCCESS) {
            utils.printMessage(CONSOLE_GREEN, table, 'SUCCESS', query, 'selecting');
        }
        res.json({
            successful: true,
            query: queryReq,
            results,
        });
    });
}

const modifyDB = (query, cols, action, queryReq, db, res, table, req, values) => {
    db.query(query, cols, (err, data) => {
        if (err) {
            let message = '';

            switch(err.errno) {
                case 1406:
                    message = 'Data too long'; break;
                
                case 1366:
                    message = 'Incorrect value(s) for column(s)'; break;

                case 1062:
                    message = 'Entry already exists'; break;

                case 1690:
                    message = 'Value(s) out of range'; break;
                
                default:
                    message = err.code; break;
            }

            utils.printMessage(CONSOLE_RED, table, 'MYSQL ERROR', err.code, action, query, cols);
            return res.json({
                success: false,
                query: queryReq,
                msg: `Error ${action} entry: ${message}`
            })
        }

        if (data.affectedRows <= 0) {
            if (utils.PRINT_DEBUG_ERRORS_SOFT) {
                utils.printMessage(CONSOLE_YELLOW, table, 'ERROR', "No matching entries exist", action);
            }
            return res.json({
                success: false,
                query: queryReq,
                msg: `Error ${action} entry: No matching entries exist`
            })
        }

        if (utils.PRINT_DEBUG_SUCCESS) {
            utils.printMessage(CONSOLE_GREEN, table, 'SUCCESS', JSON.stringify(cols), action);
        }
        res.json({
            success: true,
            query: queryReq,
        })

        if (req && values) {
            logDB(db, req.session.userID, values);
        }
    });
}

const getLogs = (query, cols, queryReq, db, res) => {
    return selectDB(query, cols, queryReq, db, res, 'DB logs ');
}

const getProducts = (query, cols, queryReq, db, res) => {
    return selectDB(query, cols, queryReq, db, res, 'DB products');
}

const getUsers = (query, cols, queryReq, db, res) => {
    return selectDB(query, cols, queryReq, db, res, 'DB users');
}

const postProducts = (query, cols, action, queryReq, db, res, req, values) => {
    modifyDB(query, cols, action, queryReq, db, res, 'DB products', req, values);
}

const postUsers = (query, cols, action, queryReq, db, res) => {
    return modifyDB(query, cols, action, queryReq, db, res, 'DB users');
}

const logDB = (db, userID, values) => {
    const query = 'INSERT INTO stupo_kiosk_dev.products_logs(user_id, user_username, action, product_id, product_name, product_quantity, product_price) VALUES(?, (SELECT username FROM stupo_kiosk_dev.users WHERE id = ?), ?, ?, ?, ?, ?)';
    const cols = [userID, userID];

    if (!userID || !values.action || !values.id) {
        utils.printMessage(CONSOLE_RED, 'DB logs ', 'ERROR', 'Required column(s) not defined');
        return false;
    }

    cols.push(values.action);
    cols.push(values.id);
    values.name ? cols.push(values.name) : cols.push(null);
    values.quantity ? cols.push(values.quantity) : cols.push(null);
    values.price ? cols.push(values.price) : cols.push(null);

    db.query(query, cols, (err, results) => {
        if (err) {
            utils.printMessage(CONSOLE_RED, 'DB logs ', 'MYSQL ERROR', err.code, 'logging', query, cols);
            return;
        }

        if (results.affectedRows === 0) {
            utils.printMessage(CONSOLE_RED, 'DB logs ', 'ERROR', 'Action not logged');
            return;
        }

        if (utils.PRINT_DEBUG_SUCCESS) {
            utils.printMessage(CONSOLE_GREEN, 'DB logs ', 'SUCCESS', JSON.stringify(cols));
        }
    });
}

module.exports = {
    getLogs, getProducts, getUsers, 
    postProducts, postUsers,
    logDB,
    //limitQueryByPrivileges,
};