import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toastSuccess } from '../../utils/sweetAlert';

const Home = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const flash = location.state?.flash;
  useEffect(()=> {
    if (!flash) return;

    toastSuccess(flash);
    navigate(location.pathname, {replace: true, state: null});
  }, [flash, location.pathname, navigate]);

  return (
    <div>
      Home</div>
  )
}

export default Home
