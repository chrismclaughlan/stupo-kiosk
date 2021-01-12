import React from 'react'
import {Container, CardDeck, Card} from 'react-bootstrap'
import {useHistory} from 'react-router-dom'

export default function Dashboard() {
    const history = useHistory();

    return (
        <Container className="dashboard-cards">
            <CardDeck>
                <Card onClick={() => history.push('/cashier-history')}>
                    <Card.Img variant="top" src="clock.png" />
                    <Card.Body>
                    <Card.Title>Cashier History</Card.Title>
                    <Card.Text>
                        View past purchase history with customers.
                    </Card.Text>
                    </Card.Body>
                </Card>
                <Card onClick={() => history.push('/cashier')}>
                    <Card.Img variant="top" src="shopping-cart.png" />
                    <Card.Body>
                    <Card.Title>Cashier</Card.Title>
                    <Card.Text>
                        Input customer purchases by barcode and process a successfull purchase.
                    </Card.Text>
                    </Card.Body>
                </Card>
                <Card onClick={() => history.push('/manage-stock')}>
                    <Card.Img variant="top" src="warehouse.png" />
                    <Card.Body>
                    <Card.Title>Manage Stock</Card.Title>
                    <Card.Text>
                        Manage stock directly, delete, update or add new products.
                    </Card.Text>
                    </Card.Body>
                </Card>
                </CardDeck>
        </Container>


    )
}
