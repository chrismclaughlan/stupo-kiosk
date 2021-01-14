import React from 'react'
import { Container, Row, Col, Card, Button, 
    ButtonGroup, ListGroup, ListGroupItem, 
    Form, Modal } from 'react-bootstrap'
import {useRef, useState, useEffect} from 'react'
import AlertPopup from './AlertPopup'
const utils = require('../Utils');

const API = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : '';

const API_QUERY_PRODUCTS = API + '/products';

const ESCAPE_KEY = 27;

const testItems = [
    {
        product: {id: 1111, name: "item1", description: "this is item 1", quantity: 10, price: 10.54}, 
        quantityToBuy: 1
    },
    {
        product: {id: 2222, name: "item2", description: "this is item 2 very nice", quantity: 20, price: 20.54}, 
        quantityToBuy: 1
    },
    {
        product: {id: 3333, name: "item3", description: "this is item 3 very nice", quantity: 30, price: 30.54}, 
        quantityToBuy: 1
    },
    {
        product: {id: 3333, name: "item3", description: "this is item 3 very nice", quantity: 30, price: 30.54}, 
        quantityToBuy: 1
    },
    {
        product: {id: 3333, name: "item3", description: "this is item 3 very nice", quantity: 30, price: 30.54}, 
        quantityToBuy: 1
    },
    {
        product: {id: 3333, name: "item3", description: "this is item 3 very nice", quantity: 30, price: 30.54}, 
        quantityToBuy: 1
    },
];

export default function Cashier() {
    const [items, setItems] = useState(null);
    const [searchString, setSearchString] = useState("");
    const [disableButtons, setDisableButtons] = useState(false);
    const refSearch = useRef();
    const [msgSuccess, setMsgSuccess] = useState("");
    const [msgWarning, setMsgWarning] = useState("");
    const [msgError, setMsgError] = useState("");
    const [processModal, setProcessModal] = useState(false);

    document.onkeydown = onKeyDown;

    useEffect(() => {
        refSearch.current.focus();
    });

    function onKeyDown(e) {
        switch(e.keyCode) {
            case ESCAPE_KEY:
                refSearch.current.focus();
                setMsgError("");
                setMsgWarning("");
                setMsgSuccess("");
                setSearchString("");
                break;
        }
    }

    function searchStringOnChange(e) {
        setSearchString(e.target.value);
    }

    function searchStringSubmit(e) {
        e.preventDefault();  /* Stop refresh */

        if (searchString.length < 1) return;
        
        setDisableButtons(true);
        setMsgError("");
        setMsgWarning("");
        setMsgSuccess("");
    
        const url = `${API_QUERY_PRODUCTS}?id=${searchString}`;
        fetch(url)
        .then(utils.handleFetchError)
        .then(res => res.json())
        .then((result) => {
            const {query} = result;

            if (result.successful) {
                console.log(`Successfully found '${query.string} in the database`);

                const newItem = {product: result.results[0], quantityToBuy: 1};

                if (items === undefined || items === null) {
                    setItems([newItem]);
                    setMsgSuccess(`Successfully added new item '${newItem.product.name}' to basket`);
                } else {
                    var found = false;
                    for(var i = 0; i < items.length; i++) {
                        if (items[i].product.id == newItem.product.id) {
                            found = true;
                            break;
                        }
                    }
    
                    if (found) {
                        addQuantityToBuy(i);
                        setMsgSuccess(`Successfully added additional '${newItem.product.name}' to basket`);
                    } else {
                        setItems([newItem, ...items]);
                        setMsgSuccess(`Successfully added new item '${newItem.product.name}' to basket`);
                    }
                }
            } else {
                setMsgWarning(`Could not find '${query.string}' in the database`);
            }
        })
        .catch((err) => {
            console.log(`Error trying to fetch '${url}': '${err}'`)
            setMsgError(`Error trying to query database: ${err}`);
        })

        setSearchString("");
        setDisableButtons(false);
    }

    function addQuantityToBuy(index) {
        let tmp = [...items];
        tmp[index].quantityToBuy = tmp[index].quantityToBuy + 1;
    
        setItems(tmp);
    }

    function removeQuantityToBuy(index) {
        if (items[index].quantityToBuy <= 1) return;

        let tmp = [...items];
        tmp[index].quantityToBuy = tmp[index].quantityToBuy - 1;
    
        setItems(tmp);
    }

    function removeItemFromIndex(i) {
        let tmp = [...items];
        
        tmp.splice(i, 1);

        setItems(tmp);

        console.log(i)
    }

    function itemsReset() {
        if (disableButtons) {
            return;
        }

        setItems(null);
    }

    function itemsProcess() {

        setProcessModal(false);
        setDisableButtons(true);
        setMsgError("");
        setMsgWarning("");
        setMsgSuccess("");

        if (disableButtons) {
            return;
        }

        if (items === null || items === undefined || items.length < 1) {
            setMsgWarning("No items in basket");
            return;
        }

        let products = [];
        items.forEach(item => {
            products.push({
                id: item.product.id,
                quantity: -(item.quantityToBuy)  /* Negative */
            });
        });
    
        const url = `${API_QUERY_PRODUCTS}/update`;
        fetch(url, {
            method: 'post',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                products
            }),
        })
        .then(utils.handleFetchError)
        .then(res => res.json())
        .then((result) => {
            if (result.success) {
                setMsgSuccess('Successfully processed basket');
            } else {
                setMsgWarning('Failed to process basket');
            }
        })
        .catch((err) => {
            console.log(`Error trying to fetch '${url}': '${err}'`)
            setMsgError(`Error trying to query database: ${err}`);
        })

        if (!msgError && !msgWarning) {
            itemsReset();
        }

        setDisableButtons(false);
    }

    function getTotalPrice() {
        let total = 0;

        if (items) {
            items.forEach(item => {
                total += item.product.price * item.quantityToBuy;
            });
        }
        
        return total.toFixed(2);
    }

    function cancelBasket() {
        setMsgError("");
        setMsgWarning("");
        setMsgSuccess("");
        itemsReset()
    }

    function renderCards() {
        const listItems = items.map((item, idx) => {
            return (
                <Row md="auto" noGutters key={idx} className="cashier-item">
                    <Col sm="auto">
                        <img 
                            src="logo_128x128.png" 
                            alt={`Picture of ${item.product.name}`}
                            width="128"
                            width="128"
                            className="cashier-item-image"
                        />
                    </Col>
                    <Col sm="6">
                        <div className="cashier-item-description">
                            <h5>{item.product.name}</h5>
                            <p className="mb-3 text-muted text-uppercase small">{item.product.description}</p>
                            <p onClick={() => removeItemFromIndex(idx)} className="cashier-item-remove">Remove</p>
                        </div>
                    </Col>
                    <Col sm="auto">
                        <Row>
                            <ButtonGroup size="sm">
                                <Button className="cashier-item-quantity-btn" variant="light" onClick={() => removeQuantityToBuy(idx)}>-</Button>
                                <Button className="cashier-item-quantity-btn" variant="light">{item.quantityToBuy}</Button>
                                <Button className="cashier-item-quantity-btn" variant="light" onClick={() => addQuantityToBuy(idx)}>+</Button>
                            </ButtonGroup>
                        </Row>
                        <Row>
                        <h6 className="cashier-item-price">€{item.product.price}</h6>
                        </Row>
                    </Col>
                </Row>
            )
        });

        return listItems;
    }

    return (
        <>
            <AlertPopup error={{message: msgSuccess, variant: "success"}}/>
            <AlertPopup error={{message: msgWarning, variant: "warning"}}/>
            <AlertPopup error={{message: msgError, variant: "danger"}}/>

            <Modal show={processModal} onHide={() => setProcessModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Process purchase</Modal.Title>
                </Modal.Header>
                <Modal.Body>Final amount due: <strong>€{getTotalPrice()}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setProcessModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => itemsProcess()}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            <Container className="cashier" fluid>

                <div className="d-flex justify-content-around cashier-search">
                    <Form inline noValidate onSubmit={!disableButtons ? (e) => searchStringSubmit(e) : null}>
                        <Col lg="auto">
                            <Form.Control
                                required
                                type="text"
                                placeholder="Search"
                                value={searchString}
                                onChange={(e) => searchStringOnChange(e)}
                                // style={{width: "100%"}}
                                ref={refSearch}
                            />
                        </Col>
                        <Col lg="auto">
                            <div className="btn-grey">
                                <Button type="submit" className="AppButton mb-2 mr-sm-2">
                                    Search
                                </Button>
                            </div>
                        </Col>
                    </Form>
                </div>

                <Row noGutters>
                    <Col md={{ span: 5, offset: 2 }}>
                            {items && renderCards()}
                    </Col>
                    <Col md={{ span: 3, offset: 1 }}>
                            <Card className="cashier-right">
                                <Card.Body>
                                    <Card.Title>The total amount of</Card.Title>
                                </Card.Body>
                                <ListGroup className="list-group-flush">
                                    <ListGroupItem>
                                        Before tax: €{getTotalPrice()}
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        After tax: TBD
                                    </ListGroupItem>
                                </ListGroup>
                                <Card.Body>
                                    <Button className="cashier-btn" onClick={() => setProcessModal(true)}>Process</Button>
                                    <Button className="cashier-btn" onClick={() => cancelBasket()}>Cancel</Button>
                                </Card.Body>
                            </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
