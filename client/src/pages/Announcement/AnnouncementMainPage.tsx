import { useAuth } from "../../contexts/AuthContext";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import AddAnnouncementFormModal from "./Components/AddAnnouncementFormModal";
import DeleteAnnouncementFormModal from "./Components/DeleteAnnouncementFormModal";
import EditAnnouncementFormModal from "./Components/EditAnnouncementFormModal";
import ViewAnnouncementModal from "./Components/ViewAnnouncementModal";
import AnnouncementList from "./Components/AnnouncementList";
import type { AnnouncementColumns } from "../../interfaces/AnnouncementInterface";

const AnnouncementMainPage = () => {
  const { user } = useAuth();
  const isAthlete = user?.role === 'Athlete';
  
  console.log("🔵 AnnouncementMainPage rendered - Role:", user?.role);

  const {
    isOpen: isAddAnnouncementFormModalOpen,
    openModal: openAddAnnouncementFormModal,
    closeModal: closeAddAnnouncementFormModal,
  } = useModal(false);

  const {
    isOpen: isEditAnnouncementFormModalOpen,
    selectedItem: selectedAnnouncementForEdit,
    openModal: openEditAnnouncementFormModal,
    closeModal: closeEditAnnouncementFormModal,
  } = useModal<AnnouncementColumns>(false);

  const {
    isOpen: isDeleteAnnouncementFormModalOpen,
    selectedItem: selectedAnnouncementForDelete,
    openModal: openDeleteAnnouncementFormModal,
    closeModal: closeDeleteAnnouncementFormModal,
  } = useModal<AnnouncementColumns>(false);

  const {
    isOpen: isViewAnnouncementModalOpen,
    selectedItem: selectedAnnouncementForView,
    openModal: openViewAnnouncementModal,
    closeModal: closeViewAnnouncementModal,
  } = useModal<AnnouncementColumns>(false);

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
      
      {/* Only render modals if NOT an athlete */}
      {!isAthlete && (
        <>
          <AddAnnouncementFormModal
            onAnnouncementAdded={showToastMessage}
            refreshKey={handleRefresh}
            isOpen={isAddAnnouncementFormModalOpen}
            onClose={closeAddAnnouncementFormModal}
          />
          <EditAnnouncementFormModal
            announcement={selectedAnnouncementForEdit}
            onAnnouncementUpdated={showToastMessage}
            refreshKey={handleRefresh}
            isOpen={isEditAnnouncementFormModalOpen}
            onClose={closeEditAnnouncementFormModal}
          />
          <DeleteAnnouncementFormModal
            announcement={selectedAnnouncementForDelete}
            onAnnouncementDeleted={showToastMessage}
            refreshKey={handleRefresh}
            isOpen={isDeleteAnnouncementFormModalOpen}
            onClose={closeDeleteAnnouncementFormModal}
          />
        </>
      )}
      
      {/* View modal available for all roles */}
      <ViewAnnouncementModal
        announcement={selectedAnnouncementForView}
        isOpen={isViewAnnouncementModalOpen}
        onClose={closeViewAnnouncementModal}
      />
      
      {/* Pass role info to AnnouncementList */}
      <AnnouncementList
        onAddAnnouncement={isAthlete ? undefined : openAddAnnouncementFormModal}
        onEditAnnouncement={isAthlete ? undefined : (announcement) => openEditAnnouncementFormModal(announcement)}
        onDeleteAnnouncement={isAthlete ? undefined : (announcement) => openDeleteAnnouncementFormModal(announcement)}
        onViewAnnouncement={(announcement) => openViewAnnouncementModal(announcement)}
        refreshKey={refresh}
        isReadOnly={isAthlete}
      />
    </>
  );
};

export default AnnouncementMainPage;