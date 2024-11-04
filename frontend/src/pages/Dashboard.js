// src/pages/Dashboard.js
import React from 'react';
import {  Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import StatisticsComponent from'./StatisticsComponent';


const Dashboard = () => {
  return (
    <div>
      <Container className="mt-4">
        <StatisticsComponent />
      </Container>
    </div>
  );
};

export default Dashboard;
