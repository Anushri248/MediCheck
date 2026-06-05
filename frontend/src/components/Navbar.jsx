import React from 'react';
import { Navbar as BootstrapNavbar, Container } from 'react-bootstrap';

const Navbar = () => {
  return (
    <BootstrapNavbar bg="white" className="shadow-sm mb-4" expand="lg">
      <Container className="max-w-7xl">
        <BootstrapNavbar.Brand href="#home" className="text-2xl font-bold text-blue-600">
          MediCheck
        </BootstrapNavbar.Brand>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
