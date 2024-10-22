import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { Card, Container, Row, Col, ListGroup, Image } from 'react-bootstrap';
import styles from './ActiveOrders.module.css';
import Price from '../../components/Price/Price';
import ProgressCountDown from '../../components/ProgressCountDown/ProgressCountDown'

const ActiveOrders: React.FC = () => {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch active orders
  const fetchActiveOrders = async () => {
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
    fetchActiveOrders();

    // Polling the API every 10 seconds for updates
    const intervalId = setInterval(fetchActiveOrders, 120000);

    return () => clearInterval(intervalId); // Clear the interval when the component unmounts
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading active orders...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <Container>
        {activeOrders.length > 0 ? (
          <Row>
            {activeOrders.map((order) => (
              <Col key={order.id} md={6} className="mb-4">
                <Card className={styles.card}>
                  <Card.Body>
                    <Card.Title className={styles.cardTitle}>Order ID: {order.id}</Card.Title>
                    <Card.Text className={styles.cardText}>
                      <strong>Status:</strong> {order.status}
                    </Card.Text>
                    <Card.Text className={styles.cardText}>
                      <strong>Payment Status:</strong> {order.payment_status}
                    </Card.Text>
                    <Card.Text className={styles.cardText}>
                      <strong>Branch:</strong> {order.branch_name}
                    </Card.Text>
                    <Card.Text className={styles.cardText}>
                      <strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}
                    </Card.Text>

                    {/* Display the list of items */}
                    <Card.Text className={styles.cardText}>
                      <strong>Items:</strong>
                    </Card.Text>
                    <ListGroup variant="flush">
                      {order.items.map((itemWrapper: any, index: number) => (
                        <ListGroup.Item key={index} className={styles.listItem}>
                          <Row>
                            <Col xs={3}>
                              <Image src={itemWrapper.item.image} thumbnail />
                            </Col>
                            <Col xs={9}>
                              <p><strong>{itemWrapper.item.name}</strong></p>
                              <p>Price: <Price price={itemWrapper.item.price} /></p>
                              <p>Quantity: {itemWrapper.quantity}</p>
                              <p>Total: <Price price={`${(itemWrapper.quantity * parseFloat(itemWrapper.item.price)).toFixed(2)}`} /></p>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    <Card.Text className={styles.cardText}>
                      <strong>Total Price:</strong> <Price price={`${parseFloat(order.total_price).toFixed(2)}`} />
                    </Card.Text>
                    {order.status=="preparing"?<ProgressCountDown initTime={order.created_at} preparation={order.preparation_time} />:<span></span>}

                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p className={styles.noOrders}>No active orders found.</p>
        )}
      </Container>
    </div>
  );
};

export default ActiveOrders;