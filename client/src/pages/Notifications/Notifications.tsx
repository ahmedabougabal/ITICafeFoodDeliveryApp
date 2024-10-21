import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';  // Import the orderService
import { formatDistanceToNow } from 'date-fns'; // Import date-fns for better date formatting
import './notifications.css'; // Import your CSS file

interface Notification {
  id: number;
  message: string;
  created_at: string;
}

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await orderService.getNotifications();
        setNotifications(data);
      } catch (err) {
        setError('Error fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) return <p className="loading">Loading notifications...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="notification-container">
      <div className="header-container">
        <h2 className="notification-header">Your Notifications (Last 24 Hours)</h2>
      </div>
      {notifications.length === 0 ? (
        <p className="no-notifications">No notifications found</p>
      ) : (
        <ul className="notification-list">
          {notifications.map(notification => (
            <li key={notification.id} className="notification-item">
              <i className="notification-icon">🔔</i>
              <div>
                <strong>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}:</strong> {notification.message}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notification;
