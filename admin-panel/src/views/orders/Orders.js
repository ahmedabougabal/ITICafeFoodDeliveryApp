import { CCardGroup, CNav, CNavItem, CNavLink, CRow } from '@coreui/react';
import React, { useState, useEffect } from 'react';
import Order from '../../components/OrderComponent/OrderComponent';
import classes from './orders.module.css';

export default function Orders() {
  // State to keep track of the active tab
  const [activeTab, setActiveTab] = useState('pending');

  // State for orders
  const [orders, setOrders] = useState([]);

  // Sample orders in case localStorage doesn't have any
  const sampleOrders = [
    {
      orderId: 333,
      userName: 'Eslam',
      totalPrice: 150,
      finishedDate:'',
      items: [
        { name: 'crepe', quantity: 2 },
        { name: 'sandwich', quantity: 2 },
        { name: 'pizza', quantity: 3 },
        { name: 'crepe', quantity: 4 }
      ],
      status: 'active'
    },
    {
      orderId: 222,
      userName: 'Ahmed',
      totalPrice: 100,
      finishedDate:'',
      items: [
        { name: 'crepe', quantity: 2 },
        { name: 'sandwich', quantity: 2 },
        { name: 'pizza', quantity: 3 },
        { name: 'crepe', quantity: 4 }
      ],
      status: 'pending'
    },
    {
      orderId: 111,
      userName: 'Kareem',
      totalPrice: 170,
      finishedDate:'99',
      items: [
        { name: 'crepe', quantity: 2 },
        { name: 'sandwich', quantity: 2 },
        { name: 'pizza', quantity: 3 },
        { name: 'crepe', quantity: 4 }
      ],
      status: 'history'
    }
  ];

  
  useEffect(() => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      setOrders(sampleOrders);
    }
  }, []); 

  
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]); 

  // Function to handle tab click
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Function to handle action (accept/reject) on an order
  const handleActionClick = (orderId, action) => {
    let updatedOrders = orders
    if (action === 'accept') {
      updatedOrders = orders.map((order) => {
        if (order.orderId === orderId) {
          return { ...order, status: 'active' };
        }
        return order;
      });
      
    }
    else if(action=='susbend'){
      updatedOrders = orders.map((order) => {
        if (order.orderId === orderId) {
          return { ...order, status: 'pending' };
        }
        return order;
      });

    }
    else if(action=='finished'){
      updatedOrders = orders.map((order) => {
        if (order.orderId === orderId) {
          return { ...order, status: 'history' };
        }
        return order;
      });

    }
    setOrders([...updatedOrders]);
  };

  return (
    <>
      <CNav className={classes.tabs} variant="tabs" style={{ marginBottom: '10px' }}>
        <CNavItem>
          <CNavLink
            active={activeTab === 'pending'}
            onClick={() => handleTabClick('pending')}
          >
            Pending
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            active={activeTab === 'active'}
            onClick={() => handleTabClick('active')}
          >
            Active
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            active={activeTab === 'history'}
            onClick={() => handleTabClick('history')}
          >
            History
          </CNavLink>
        </CNavItem>
      </CNav>

      <CRow>
        {orders
          .filter((order) => order.status === activeTab)
          .map((order) => (
            <Order key={order.orderId} order={order} actionHandler={handleActionClick} />
          ))}
      </CRow>
    </>
  );
}
