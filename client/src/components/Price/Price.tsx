import React from 'react'
interface PriceProps{
    price:number;
    locale?:string;
    currency?:string;
}
const Price:React.FC<PriceProps> = ({price,locale = 'en-EG',currency='EGP'}) => {
  const formatPrice = () =>
    new Intl.NumberFormat(locale,{
        style:'currency',
        currency,
    }).format(price);
    return (
    <span>{formatPrice()}</span>
  )
}

export default Price