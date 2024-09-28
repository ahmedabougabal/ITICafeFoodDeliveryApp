import React from 'react';
import { Rate } from 'antd';

interface StarRatingProps {
    stars: number,
    size?: number
}


const App: React.FC<StarRatingProps> = ({ stars,size=18 }) => {
    const styles = {
        fontSize: size + 'px',
        marginRight: `${size / 6} px`,
        color:'#af1313',
        display:'flex'
    }
    return (
        <div >
            <Rate allowHalf defaultValue={2.5} value={stars} style={styles} disabled />
        </div>
        
    )
};

export default App;