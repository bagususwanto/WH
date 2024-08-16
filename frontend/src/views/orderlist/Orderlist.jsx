import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardFooter, Button, ListGroup, ListGroupItem } from '@coreui/react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

const Orderlist = () => {
  // Data statis
  const items = [
    { id: 1, photoUrl: 'https://via.placeholder.com/150', name: 'Item 1', price: 19.99, description: 'Deskripsi Item 1' },
    { id: 2, photoUrl: 'https://via.placeholder.com/150', name: 'Item 2', price: 29.99, description: 'Deskripsi Item 2' },
    // Tambahkan item lainnya jika perlu
  ];

  const [cart, setCart] = useState([]);

  const handleAddToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  const handleRemoveFromCart = (itemToRemove) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== itemToRemove.id));
  };

  return (
    <Router>
      <Container>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <Link to="/">
            <Button color="info">Belanja</Button>
          </Link>
          <Link to="/cart">
            <Button color="success">Keranjang ({cart.length})</Button>
          </Link>
        </header>
        <Switch>
          <Route exact path="/">
            <Row>
              {items.map(item => (
                <Col key={item.id} sm="4" style={{ marginBottom: '1rem' }}>
                  <Card>
                    <img src={item.photoUrl} alt={item.name} className="card-img-top" style={{ height: '12rem', objectFit: 'cover' }} />
                    <CardBody>
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text">{item.description}</p>
                      <p className="card-price">Harga: ${item.price.toFixed(2)}</p>
                    </CardBody>
                    <CardFooter>
                      <Button color="primary" onClick={() => handleAddToCart(item)}>Tambah ke Keranjang</Button>
                    </CardFooter>
                  </Card>
                </Col>
              ))}
            </Row>
          </Route>
          <Route path="/cart">
            <h1>Keranjang Belanja</h1>
            {cart.length > 0 ? (
              <ListGroup>
                {cart.map((item, index) => (
                  <ListGroupItem key={index}>
                    {item.name} - ${item.price.toFixed(2)}
                    <Button color="danger" className="float-right" onClick={() => handleRemoveFromCart(item)}>Hapus</Button>
                  </ListGroupItem>
                ))}
              </ListGroup>
            ) : (
              <p>Keranjang kosong</p>
            )}
          </Route>
        </Switch>
      </Container>
    </Router>
  );
};

export default Orderlist;
