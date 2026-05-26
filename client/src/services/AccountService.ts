import AxiosInstance from "./AxiosInstance";

interface ProfileUpdateData {
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix_name: string;
}

interface UsernameUpdateData {
  new_username: string;
  current_password: string;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

const AccountService = {
  updateProfile: async (data: ProfileUpdateData) => {
    try {
      const response = await AxiosInstance.put("/account/update-profile", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateUsername: async (data: UsernameUpdateData) => {
    try {
      const response = await AxiosInstance.put("/account/update-username", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (data: PasswordChangeData) => {
    try {
      const response = await AxiosInstance.put("/account/change-password", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await AxiosInstance.get("/account/profile");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ✅ NEW: Upload profile picture
  uploadProfilePicture: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);
      const response = await AxiosInstance.post(
        "/account/upload-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ✅ NEW: Remove profile picture
  removeProfilePicture: async () => {
    try {
      const response = await AxiosInstance.delete(
        "/account/remove-profile-picture"
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AccountService;