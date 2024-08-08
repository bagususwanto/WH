import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/AxiosInstance';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await axiosInstance.delete('/logout');
        // localStorage.removeItem('token');
        navigate('/login'); 
      } catch (error) {
        console.error(error);
      }
    };

    logout();
  }, [navigate]);

  return <div>Logging out...</div>;
};

export default Logout;
