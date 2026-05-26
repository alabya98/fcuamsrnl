import { useEffect } from "react";
import EditSportForm from "./Components/EditSportForm";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useToastMessage } from "../../hooks/useToastMessage";

function EditSportPage() {
  useEffect(() => {
    document.title = "Sport Edit Page";
  }, []);

  const {
    message: toastMessage,
    isVisible: toastMessageIsVisible,
    showToastMessage,
    closeToastMessage,
  } = useToastMessage("", false);

  return (
    <>
      <ToastMessage 
        message={toastMessage} 
        isVisible={toastMessageIsVisible} 
        onClose={closeToastMessage} 
      />
      <EditSportForm onSportUpdated={showToastMessage} />
    </>
  );
}

export default EditSportPage;