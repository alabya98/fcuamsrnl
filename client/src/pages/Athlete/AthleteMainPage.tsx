import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import AddAthleteFormModal from "./Components/AddAthleteFormModal";
import DeleteAthleteFormModal from "./Components/DeleteAthleteFormModal";
import EditAthleteFormModal from "./Components/EditAthleteFormModal";
import ToggleAthleteStatusModal from "./Components/ToggleAthleteStatusModal";
import AthleteList from "./Components/AthleteList";
import type { AthleteColumns } from "../../interfaces/AthleteInterface";

const AthleteMainPage = () => {
  const {
    isOpen: isAddAthleteFormModalOpen,
    openModal: openAddAthleteFormModal,
    closeModal: closeAddAthleteFormModal,
  } = useModal(false);

  const {
    isOpen: isEditAthleteFormModalOpen,
    selectedItem: selectedAthleteForEdit,
    openModal: openEditAthleteFormModal,
    closeModal: closeEditAthleteFormModal,
  } = useModal(false);

  const {
    isOpen: isDeleteAthleteFormModalOpen,
    selectedItem: selectedAthleteForDelete,
    openModal: openDeleteAthleteFormModal,
    closeModal: closeDeleteAthleteFormModal,
  } = useModal(false);

  const {
    isOpen: isToggleStatusModalOpen,
    selectedItem: selectedAthleteForToggle,
    openModal: openToggleStatusModal,
    closeModal: closeToggleStatusModal,
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
      <AddAthleteFormModal
        onAthleteAdded={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isAddAthleteFormModalOpen}
        onClose={closeAddAthleteFormModal}
      />
      <EditAthleteFormModal
        athlete={selectedAthleteForEdit as AthleteColumns | null}
        onAthleteUpdated={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isEditAthleteFormModalOpen}
        onClose={closeEditAthleteFormModal}
      />
      <DeleteAthleteFormModal
        athlete={selectedAthleteForDelete as AthleteColumns | null}
        onAthleteDeleted={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isDeleteAthleteFormModalOpen}
        onClose={closeDeleteAthleteFormModal}
      />
      <ToggleAthleteStatusModal
        athlete={selectedAthleteForToggle as AthleteColumns | null}
        onAthleteStatusToggled={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isToggleStatusModalOpen}
        onClose={closeToggleStatusModal}
      />
      <AthleteList
        onAddAthlete={openAddAthleteFormModal}
        onEditAthlete={(athlete) => openEditAthleteFormModal(athlete)}
        onDeleteAthlete={(athlete) => openDeleteAthleteFormModal(athlete)}
        onToggleStatus={(athlete) => openToggleStatusModal(athlete)}
        refreshKey={refresh}
      />
    </>
  );
};

export default AthleteMainPage;