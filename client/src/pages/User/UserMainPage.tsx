import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import AddUserFormModal from "./Components/AddUserFormModal";
import DeleteUserFormModal from "./Components/DeleteUserFormModal";
import EditUserFormModal from "./Components/EditUserFormModal";
import UserList from "./Components/UserList";
import type { UserColumns } from "../../interfaces/UserInterface";

const UserMainPage = () => {
  const {
    isOpen: isAddUserFormModalOpen,
    openModal: openAddUserFormModal,
    closeModal: closeAddUserFormModal,
  } = useModal(false);

  const {
    isOpen: isEditUserFormModalOpen,
    selectedItem: selectedUserForEdit,
    openModal: openEditUserFormModal,
    closeModal: closeEditUserFormModal,
  } = useModal<UserColumns>(false);  // ✅ Specify UserColumns type

  const {
    isOpen: isDeleteUserFormModalOpen,
    selectedItem: selectedUserForDelete,
    openModal: openDeleteUserFormModal,
    closeModal: closeDeleteUserFormModal,
  } = useModal<UserColumns>(false);  // ✅ Specify UserColumns type

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
      <AddUserFormModal
        onUserAdded={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isAddUserFormModalOpen}
        onClose={closeAddUserFormModal}
      />
      <EditUserFormModal
        user={selectedUserForEdit}
        onUserUpdated={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isEditUserFormModalOpen}
        onClose={closeEditUserFormModal}
      />
      <DeleteUserFormModal
        user={selectedUserForDelete}
        onUserDeleted={showToastMessage}
        refreshKey={handleRefresh}
        isOpen={isDeleteUserFormModalOpen}
        onClose={closeDeleteUserFormModal}
      />
      <UserList
        onAddUser={openAddUserFormModal}
        onEditUser={(user) => openEditUserFormModal(user)}
        onDeleteUser={(user) => openDeleteUserFormModal(user)}
        refreshKey={refresh}
      />
    </>
  );
};

export default UserMainPage;