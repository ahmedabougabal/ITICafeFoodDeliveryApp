import React from 'react';
import {
  MDBFooter,
  MDBContainer,
  MDBIcon,
  MDBBtn
} from 'mdb-react-ui-kit';

export default function Footer() {
  return (
    <MDBFooter className='bg-light text-center text-white '>
      <div className='text-center p-3' style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        © 2024 Copyright:
        <a className='text-white' href='https://mdbootstrap.com/'>
          ITICofeFood.com
        </a>
      </div>
    </MDBFooter>
  );
}
