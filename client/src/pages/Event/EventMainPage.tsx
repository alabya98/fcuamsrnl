import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import AddEventFormModal from "./Components/AddEventFormModal";
import DeleteEventFormModal from "./Components/DeleteEventFormModal";
import EditEventFormModal from "./Components/EditEventFormModal";
import EventList from "./Components/EventList";
import type { EventColumns } from "../../interfaces/EventInterface"; // ✅ ADD THIS

const EventMainPage = () => {
  console.log("🔵 EventMainPage rendered");

  const {
    isOpen: isAddEventFormModalOpen,
    openModal: openAddEventFormModal,
    closeModal: closeAddEventFormModal,
  } = useModal(false);

  const {
    isOpen: isEditEventFormModalOpen,
    selectedItem: selectedEventForEdit, // ✅ CHANGED: selectedUser → selectedItem
    openModal: openEditEventFormModal,
    closeModal: closeEditEventFormModal,
  } = useModal(false);

  const {
    isOpen: isDeleteEventFormModalOpen,
    selectedItem: selectedEventForDelete, // ✅ CHANGED: selectedUser → selectedItem
    openModal: openDeleteEventFormModal,
    closeModal: closeDeleteEventFormModal,
  } = useModal(false);

  const {
    message: toastMessage,
    isVisible: toastMessageIsVisible,
    showToastMessage,
    closeToastMessage,
  } = useToastMessage("", false);

  const { refresh, handleRefresh } = useRefresh(false);

  return (
    <>
      <ToastMessage
        message={toastMessage}
        isVisible={toastMessageIsVisible}
        onClose={closeToastMessage}
      />
      <AddEventFormModal
        onEventAdded={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isAddEventFormModalOpen}
        onClose={closeAddEventFormModal}
      />
      <EditEventFormModal
        event={selectedEventForEdit as EventColumns | null} // ✅ TYPE CAST
        onEventUpdated={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isEditEventFormModalOpen}
        onClose={closeEditEventFormModal}
      />
      <DeleteEventFormModal
        event={selectedEventForDelete as EventColumns | null} // ✅ TYPE CAST
        onEventDeleted={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isDeleteEventFormModalOpen}
        onClose={closeDeleteEventFormModal}
      />
      <EventList
        onAddEvent={openAddEventFormModal}
        onEditEvent={(event) => openEditEventFormModal(event)}
        onDeleteEvent={(event) => openDeleteEventFormModal(event)}
        refreshKey={refresh}
      />
    </>
  );
};

export default EventMainPage;