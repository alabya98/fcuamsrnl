import { useState } from "react";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import AddEquipmentModal from "./Components/AddEquipmentModal";
import EditEquipmentModal from "./Components/EditEquipmentModal";
import EquipmentRequestModal from "./Components/EquipmentRequestModal";
import ViewEquipmentRequestsModal from "./Components/ViewEquipmentRequestsModal";
import MyRequestsModal from "./Components/MyRequestsModal";
import EquipmentList from "./Components/EquipmentList";
import Modal from "../../components/Modal";
import EquipmentService from "../../services/EquipmentService";
import type { EquipmentColumns } from "../../interfaces/EquipmentInterface";

const EquipmentMainPage = () => {
  const {
    isOpen: isAddEquipmentModalOpen,
    openModal: openAddEquipmentModal,
    closeModal: closeAddEquipmentModal,
  } = useModal(false);

  const {
    isOpen: isEditEquipmentModalOpen,
    selectedItem: selectedEquipmentForEdit,
    openModal: openEditEquipmentModal,
    closeModal: closeEditEquipmentModal,
  } = useModal(false);

  const {
    isOpen: isRequestModalOpen,
    openModal: openRequestModal,
    closeModal: closeRequestModal,
  } = useModal(false);

  const {
    isOpen: isViewRequestsModalOpen,
    openModal: openViewRequestsModal,
    closeModal: closeViewRequestsModal,
  } = useModal(false);

  const {
    isOpen: isMyRequestsModalOpen,
    openModal: openMyRequestsModal,
    closeModal: closeMyRequestsModal,
  } = useModal(false);

  const {
    message: toastMessage,
    isVisible: toastMessageIsVisible,
    showToastMessage,
    closeToastMessage,
  } = useToastMessage("", false);

  const { refresh, handleRefresh } = useRefresh(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEquipmentForDelete, setSelectedEquipmentForDelete] =
    useState<EquipmentColumns | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track which tab to open when the requests modal is opened
  const [requestsInitialTab, setRequestsInitialTab] = useState<"all" | "print">("all");

  const handleOpenViewRequests = () => {
    setRequestsInitialTab("all");
    openViewRequestsModal();
  };

  const handleOpenPrintApproved = () => {
    setRequestsInitialTab("print");
    openViewRequestsModal();
  };

  const handleOpenDeleteModal = (equipment: EquipmentColumns) => {
    setSelectedEquipmentForDelete(equipment);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedEquipmentForDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEquipmentForDelete) return;
    try {
      setIsDeleting(true);
      const res = await EquipmentService.destroyEquipment(
        selectedEquipmentForDelete.equipment_id
      );
      if (res.status === 200) {
        showToastMessage("Equipment deleted successfully");
        handleRefresh();
        handleCloseDeleteModal();
      }
    } catch (error: any) {
      console.error("Error deleting equipment:", error);
      showToastMessage(
        error.response?.data?.message || "Failed to delete equipment"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ToastMessage
        message={toastMessage}
        isVisible={toastMessageIsVisible}
        onClose={closeToastMessage}
      />

      <AddEquipmentModal
        onEquipmentAdded={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isAddEquipmentModalOpen}
        onClose={closeAddEquipmentModal}
      />

      <EditEquipmentModal
        equipment={selectedEquipmentForEdit as EquipmentColumns | null}
        onEquipmentUpdated={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isEditEquipmentModalOpen}
        onClose={closeEditEquipmentModal}
      />

      <EquipmentRequestModal
        onRequestSubmitted={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isRequestModalOpen}
        onClose={closeRequestModal}
      />

      <ViewEquipmentRequestsModal
        onRequestProcessed={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isViewRequestsModalOpen}
        onClose={closeViewRequestsModal}
        initialTab={requestsInitialTab}
      />

      <MyRequestsModal
        isOpen={isMyRequestsModalOpen}
        onClose={closeMyRequestsModal}
      />

      <EquipmentList
        onAddEquipment={openAddEquipmentModal}
        onEditEquipment={(equipment) => openEditEquipmentModal(equipment)}
        onDeleteEquipment={handleOpenDeleteModal}
        onRequestEquipment={openRequestModal}
        onViewRequests={handleOpenViewRequests}
        onPrintApproved={handleOpenPrintApproved}
        onViewMyRequests={openMyRequestsModal}
        refreshKey={refresh}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} size="small">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-100 to-red-200 rounded-2xl shadow-inner">
            <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">Delete Equipment</h3>
          <p className="text-gray-500 text-center text-sm mb-1">Are you sure you want to delete</p>
          <p className="text-center font-bold text-gray-800 mb-5">
            "{selectedEquipmentForDelete?.equipment_name}"?
          </p>
          <p className="text-xs text-center text-red-500 font-medium mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 hover:from-gray-200 hover:via-gray-300 hover:to-slate-200 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 hover:from-rose-600 hover:via-red-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EquipmentMainPage;