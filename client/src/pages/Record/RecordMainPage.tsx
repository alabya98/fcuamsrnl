import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import AddRecordFormModal from "./Components/AddRecordFormModal";
import DeleteRecordFormModal from "./Components/DeleteRecordFormModal";
import EditRecordFormModal from "./Components/EditRecordFormModal";
import RecordList from "./Components/RecordList";
import type { RecordColumns } from "../../interfaces/RecordInterface";

const RecordMainPage = () => {
  console.log("🔵 RecordMainPage rendered");

  const {
    isOpen: isAddRecordFormModalOpen,
    openModal: openAddRecordFormModal,
    closeModal: closeAddRecordFormModal,
  } = useModal(false);

  const {
    isOpen: isEditRecordFormModalOpen,
    selectedItem: selectedRecordForEdit,
    openModal: openEditRecordFormModal,
    closeModal: closeEditRecordFormModal,
  } = useModal<RecordColumns>(false);

  const {
    isOpen: isDeleteRecordFormModalOpen,
    selectedItem: selectedRecordForDelete,
    openModal: openDeleteRecordFormModal,
    closeModal: closeDeleteRecordFormModal,
  } = useModal<RecordColumns>(false);

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
      <AddRecordFormModal
        onRecordAdded={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isAddRecordFormModalOpen}
        onClose={closeAddRecordFormModal}
      />
      <EditRecordFormModal
        record={selectedRecordForEdit}
        onRecordUpdated={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isEditRecordFormModalOpen}
        onClose={closeEditRecordFormModal}
      />
      <DeleteRecordFormModal
        record={selectedRecordForDelete}
        onRecordDeleted={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isDeleteRecordFormModalOpen}
        onClose={closeDeleteRecordFormModal}
      />
      <RecordList
        onAddRecord={openAddRecordFormModal}
        onEditRecord={(record) => openEditRecordFormModal(record)}
        onDeleteRecord={(record) => openDeleteRecordFormModal(record)}
        refreshKey={refresh}
      />
    </>
  );
};

export default RecordMainPage;