import React from 'react'

const Price= ({price,locale = 'en-EG',currency='EGP'}) => {
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