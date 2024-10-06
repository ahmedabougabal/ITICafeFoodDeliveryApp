import { useNavigate } from 'react-router-dom';
import styles from './orderSuccessPage.module.css';

const OrderSuccessPage = () => {
    const navigate = useNavigate();

    const handleReturnHome = () => {
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Order Created Successfully</h1>
            <p className={styles.message}>Your order has been successfully created. Thank you for your purchase!</p>
            <button className={styles.button} onClick={handleReturnHome}>Return Home</button>
        </div>
    );
};

export default OrderSuccessPage;