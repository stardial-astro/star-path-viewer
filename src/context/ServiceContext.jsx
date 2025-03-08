// src/context/ServiceContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
  const [serviceChosen, setServiceChosen] = useState(null);

  return (
    <ServiceContext.Provider value={{ serviceChosen, setServiceChosen }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => useContext(ServiceContext);
