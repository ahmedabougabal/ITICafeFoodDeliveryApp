import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { Card, Container, Row, Col, ListGroup, Image } from 'react-bootstrap';

const ActiveOrders: React.FC = () => {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch active orders
  const ActiveOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.ActiveOrders();
      setActiveOrders(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to fetch active orders');
      setLoading(false);
    }
  };

  // Fetch active orders initially and then periodically
  useEffect(() => {
    ActiveOrders();

    // Polling the API every 10 seconds for updates
    const intervalId = setInterval(ActiveOrders, 10000); // 10,000 ms = 10 seconds

    return () => clearInterval(intervalId); // Clear the interval when the component unmounts
  }, []);

  if (loading) {
    return <div>Loading active orders...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      {activeOrders.length > 0 ? (
        <Row>
          {activeOrders.map((order) => (
            <Col key={order.id} md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Order ID: {order.id}</Card.Title>
                  <Card.Text>
                    <strong>Status:</strong> {order.status}
                  </Card.Text>
                  <Card.Text>
                    <strong>Payment Status:</strong> {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Branch:</strong> {order.branch_name}
                  </Card.Text>
                  <Card.Text>
                    <strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}
                  </Card.Text>

                  {/* Display the list of items */}
                  <Card.Text>
                    <strong>Items:</strong>
                  </Card.Text>
                  <ListGroup variant="flush">
                    {order.items.map((itemWrapper: any, index: number) => (
                      <ListGroup.Item key={index}>
                        <Row>
                          <Col xs={3}>
                            <Image src={itemWrapper.item.image} thumbnail />
                          </Col>
                          <Col xs={9}>
                            <p><strong>{itemWrapper.item.name}</strong></p>
                            <p>Price: ${itemWrapper.item.price}</p>
                            <p>Quantity: {itemWrapper.quantity}</p>
                            <p>Total: ${(itemWrapper.quantity * parseFloat(itemWrapper.item.price)).toFixed(2)}</p>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>

                  <Card.Text className="mt-3">
                    <strong>Total Price:</strong> ${parseFloat(order.total_price).toFixed(2)}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>No active orders found.</p>
      )}
    </Container>
  );
};

export default ActiveOrders;
