import { useState } from "react";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";

import AddPracticeScheduleFormModal from "./Components/AddPracticeScheduleFormModal";
import DeletePracticeScheduleFormModal from "./Components/DeletePracticeScheduleFormModal";
import EditPracticeScheduleFormModal from "./Components/EditPracticeScheduleFormModal";
import PracticeScheduleList from "./Components/PracticeScheduleList";
import MarkAttendanceModal from "./Components/MarkAttendanceModal";

import type { PracticeScheduleColumns } from "../../interfaces/PracticeScheduleInterface";

const PracticeScheduleMainPage = () => {
  console.log("🔵 PracticeScheduleMainPage rendered");

  // Add Modal
  const {
    isOpen: isAddPracticeScheduleFormModalOpen,
    openModal: openAddPracticeScheduleFormModal,
    closeModal: closeAddPracticeScheduleFormModal,
  } = useModal<PracticeScheduleColumns>(false);

  // Edit Modal
  const {
    isOpen: isEditPracticeScheduleFormModalOpen,
    selectedItem: selectedPracticeScheduleForEdit,
    openModal: openEditPracticeScheduleFormModal,
    closeModal: closeEditPracticeScheduleFormModal,
  } = useModal<PracticeScheduleColumns>(false);

  // Delete Modal
  const {
    isOpen: isDeletePracticeScheduleFormModalOpen,
    selectedItem: selectedPracticeScheduleForDelete,
    openModal: openDeletePracticeScheduleFormModal,
    closeModal: closeDeletePracticeScheduleFormModal,
  } = useModal<PracticeScheduleColumns>(false);

  // ✅ NEW: Mark Attendance Modal
  const [selectedPracticeForAttendance, setSelectedPracticeForAttendance] = useState<PracticeScheduleColumns | null>(null);
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false);

  // Toast Message
  const {
    message: toastMessage,
    isVisible: toastMessageIsVisible,
    showToastMessage,
    closeToastMessage,
  } = useToastMessage("", false);

  // Refresh Hook
  const { refresh, handleRefresh } = useRefresh(false);

  // ✅ NEW: Handlers for Attendance
  const handleMarkAttendance = (practiceSchedule: PracticeScheduleColumns) => {
    setSelectedPracticeForAttendance(practiceSchedule);
    setIsMarkAttendanceModalOpen(true);
  };

  const handleAttendanceMarked = (message: string) => {
    showToastMessage(message);
    handleRefresh();
  };

  return (
    <>
      {/* ✅ Toast Message */}
      <ToastMessage
        message={toastMessage}
        isVisible={toastMessageIsVisible}
        onClose={closeToastMessage}
      />

      {/* ✅ Add Practice Schedule Modal */}
      <AddPracticeScheduleFormModal
        onPracticeScheduleAdded={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isAddPracticeScheduleFormModalOpen}
        onClose={closeAddPracticeScheduleFormModal}
      />

      {/* ✅ Edit Practice Schedule Modal */}
      <EditPracticeScheduleFormModal
        practiceSchedule={selectedPracticeScheduleForEdit}
        onPracticeScheduleUpdated={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isEditPracticeScheduleFormModalOpen}
        onClose={closeEditPracticeScheduleFormModal}
      />

      {/* ✅ Delete Practice Schedule Modal */}
      <DeletePracticeScheduleFormModal
        practiceSchedule={selectedPracticeScheduleForDelete}
        onPracticeScheduleDeleted={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isDeletePracticeScheduleFormModalOpen}
        onClose={closeDeletePracticeScheduleFormModal}
      />

      {/* ✅ NEW: Mark Attendance Modal */}
      <MarkAttendanceModal
        practiceSchedule={selectedPracticeForAttendance}
        isOpen={isMarkAttendanceModalOpen}
        onClose={() => {
          setIsMarkAttendanceModalOpen(false);
          setSelectedPracticeForAttendance(null);
        }}
        onSuccess={handleAttendanceMarked}
      />

      {/* ✅ Practice Schedule List */}
      <PracticeScheduleList
        onAddPracticeSchedule={openAddPracticeScheduleFormModal}
        onEditPracticeSchedule={(practiceSchedule) =>
          openEditPracticeScheduleFormModal(practiceSchedule)
        }
        onDeletePracticeSchedule={(practiceSchedule) =>
          openDeletePracticeScheduleFormModal(practiceSchedule)
        }
        onMarkAttendance={handleMarkAttendance}
        refreshKey={refresh}
      />
    </>
  );
};

export default PracticeScheduleMainPage;