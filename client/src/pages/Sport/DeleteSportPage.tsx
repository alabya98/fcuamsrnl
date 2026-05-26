import { useEffect } from 'react';
import DeleteSportForm from './Components/DeleteSportForm';

function DeleteSportPage() {
  useEffect(() => {
    document.title = 'Sport Delete Page';
  }, []);
  
  return (
    <>
      <DeleteSportForm />
    </>
  );
}

export default DeleteSportPage;