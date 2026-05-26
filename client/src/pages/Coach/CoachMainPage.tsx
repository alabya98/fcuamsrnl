import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import AddCoachFormModal from "./Components/AddCoachFormModal";
import DeleteCoachFormModal from "./Components/DeleteCoachFormModal";
import EditCoachFormModal from "./Components/EditCoachFormModal";
import CoachList from "./Components/CoachList";
import type { CoachColumns } from "../../interfaces/CoachInterface"; // ✅ add this

const CoachMainPage = () => {
  console.log("🔵 CoachMainPage rendered");

  // Add modal (no selected coach)
  const {
    isOpen: isAddCoachFormModalOpen,
    openModal: openAddCoachFormModal,
    closeModal: closeAddCoachFormModal,
  } = useModal(false);

  // Edit modal (typed as CoachColumns)
  const {
    isOpen: isEditCoachFormModalOpen,
    selectedItem: selectedCoachForEdit, // ✅ fixed name
    openModal: openEditCoachFormModal,
    closeModal: closeEditCoachFormModal,
  } = useModal<CoachColumns>(false); // ✅ specify type

  // Delete modal (typed as CoachColumns)
  const {
    isOpen: isDeleteCoachFormModalOpen,
    selectedItem: selectedCoachForDelete, // ✅ fixed name
    openModal: openDeleteCoachFormModal,
    closeModal: closeDeleteCoachFormModal,
  } = useModal<CoachColumns>(false); // ✅ specify type

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

      <AddCoachFormModal
        onCoachAdded={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isAddCoachFormModalOpen}
        onClose={closeAddCoachFormModal}
      />

      <EditCoachFormModal
        coach={selectedCoachForEdit}
        onCoachUpdated={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isEditCoachFormModalOpen}
        onClose={closeEditCoachFormModal}
      />

      <DeleteCoachFormModal
        coach={selectedCoachForDelete}
        onCoachDeleted={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isDeleteCoachFormModalOpen}
        onClose={closeDeleteCoachFormModal}
      />

      <CoachList
        onAddCoach={openAddCoachFormModal}
        onEditCoach={(coach) => openEditCoachFormModal(coach)}
        onDeleteCoach={(coach) => openDeleteCoachFormModal(coach)}
        refreshKey={refresh}
      />
    </>
  );
};

export default CoachMainPage;
