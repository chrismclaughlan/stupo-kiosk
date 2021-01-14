const utils = require('./Utils')
const dbManagement = require('./DBManagement')
const auth = require('./Auth')

class ProductsRouter {

    constructor(app, db) {
        this.add(app, db)
        this.remove(app, db)
        this.update(app, db)
    }

    update(app, db) {
        app.post('/products/update', auth.userAuthenticated, (req, res) => {
            let globalQuery = "";
            let globalCols = [];
            const isAdmin = auth.userIsAdmin(req);

            /* Validate and retreive POST data */

            if (! utils.validateRequest(req.body, ['products'], res)) return;
            const {products} = req.body;
            
            if (! utils.validateIsArray(products, res)) return;

            for (var i = 0; i < products.length; i++) {
                let query, cols = [];
                let {id, name, quantity, price} = products[i];
                
                if (id === undefined) {
                    continue;
                }

                name = (name !== undefined) ? name.trim().toLowerCase() : null;
                quantity = (quantity !== undefined) ? quantity : null;
                price = (price !== undefined) ? price : null;

                /* Construct query */

                query = 'UPDATE products SET ';

                if (quantity) {
                    query += 'quantity = quantity + ?';
                    cols.push(quantity);
                }

                // Only allow admins to change bookcase / shelf
                if (isAdmin) {

                    if (name) {
                        if (cols.length > 0) {
                            query += ', '
                        }
                        query += 'name = ?';
                        cols.push(name);
                    }

                    if (price) {
                        if (cols.length > 0) {
                            query += ', '
                        }
                        query += 'price = ?';
                        cols.push(price);
                    }
                }

                // A minimum of 1 column has to be provided
                if (cols.length === 0) {
                    continue;
                }

                query += ' WHERE id = ?'
                cols.push(id);



                globalQuery += query + "; ";
                globalCols = globalCols.concat(cols);
            }

            if (globalQuery && globalQuery.length > 0) {
                dbManagement.postProducts(globalQuery, globalCols, "updating", products, db, res, req, null);
            }


            //const product = products[0];

        //     if (! utils.validateRequest(product, ['id'], res)) return false;
        //     let {id, name, quantity, price} = product;

        //     name = name ? name.trim().toLowerCase() : null;
        //     quantity = (quantity !== undefined) ? product.quantity : null;

        //     /* Construct query */

        //     query = 'UPDATE products SET ';

        //     if (quantity) {
        //         query += 'quantity = quantity + ?';
        //         cols.push(quantity);
        //     }

        //     // Only allow admins to change bookcase / shelf
        //     if (auth.userIsAdmin(req)) {

        //         if (name) {
        //             if (cols.length > 0) {
        //                 query += ', '
        //             }
        //             query += 'name = ?';
        //             cols.push(name);
        //         }

        //         if (price) {
        //             if (cols.length > 0) {
        //                 query += ', '
        //             }
        //             query += 'price = ?';
        //             cols.push(price);
        //         }
        //     }

        //     // A minimum of 1 column has to be provided
        //     if (cols.length === 0) {
        //         res.json({
        //             success: false,
        //             msg: 'Error parsing request: Suitable element(s) of product not defined'
        //         })
        //         return false;
        //     }

        //     query += ' WHERE id = ?'
        //     cols.push(id);

        //    // query = dbManagement.limitQueryByPrivileges(query, cols, req.session.userID, auth.PRIVILIGES_ADMIN);

        //     // action, partName, partQuantity, partBookcase, partShelf
        //     const action = 'updating';
        //     const values = {
        //         action,
        //         id,
        //         name,
        //         quantity,
        //         price,
        //     }
        //     dbManagement.postProducts(query, cols, action, product, db, res, req, values);
        });
    }

    add(app, db) {
        app.post('/products/add', auth.userAuthorised, (req, res) => {
            let query, cols = [];

            /* Validate and retreive POST data */

            if (! utils.validateRequest(req.body, ['products'], res)) return;
            const {products} = req.body;

            if (! utils.validateIsArray(products, res)) return;
            const product = products[0];

            if (! utils.validateRequest(product, ['id', 'name', 'quantity', 'price'], res)) return;
            let {id, name, quantity, price} = product;

            name = name.trim().toLowerCase();

            /* Construct query */
            
            query = 'INSERT INTO products(id, name, quantity, price) VALUES(?, ?, ?, ?)'
            cols = [id, name, quantity, price];

            // let query = 'INSERT INTO parts(quantity, bookcase, shelf, name) SELECT ?, ?, ?, ? FROM users WHERE id = ? AND privileges >= ?'
            // cols.push(req.session.userID);
            // cols.push(auth.PRIVILIGES_ADMIN);

            const action = 'adding';
            const values = {
                action,
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                price: product.price,
            }
            dbManagement.postProducts(query, cols, action, product, db, res, req, values);
        });
    }

    remove(app, db) {
        app.post('/products/remove', auth.userAuthorised, (req, res) => {
            let query, cols = [];

            /* Validate and retreive POST data */

            if (! utils.validateRequest(req.body, ['products'], res)) return;
            const {products} = req.body;

            if (! utils.validateIsArray(products, res)) return;
            const product = products[0];

            if (! utils.validateRequest(product, ['id'], res)) return;
            let {id} = product;
            
            //name = name.trim().toLowerCase();

            /* Construct query */

            query = 'DELETE FROM products WHERE id = ?';
            cols = [id];

            //query = dbManagement.limitQueryByPrivileges(query, cols, req.session.userID, auth.PRIVILIGES_ADMIN)

            const action = 'deleting';
            const values = {
                action,
                id,
            }
            dbManagement.postProducts(query, cols, action, product, db, res, req, values);
        });
    }
}

module.exports = ProductsRouter;