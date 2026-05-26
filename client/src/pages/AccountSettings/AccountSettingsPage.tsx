import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AccountService from "../../services/AccountService";
import Modal from "../../components/Modal/index";
import ProfilePictureUpload from "../../components/button/ProfilePictureUpload";
import { useToastMessage } from "../../hooks/useToastMessage";
import ToastMessage from "../../components/ToastMessage/ToastMessage";

interface ProfileFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix_name: string;
}

interface UsernameFormData {
  new_username: string;
  current_password: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

const EyeIcon = ({ visible }: { visible: boolean }) =>
  visible ? (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ) : (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

// FIX: Convert any absolute storage URL (from either origin) into a
// relative /storage/... path so Vite's proxy can forward it to Laravel.
// Absolute URLs bypass the Vite dev proxy entirely.
const toRelativeStorageUrl = (url: string): string => {
  // Strip http://127.0.0.1:8000 or http://localhost:5173 prefix
  return url.replace(/^https?:\/\/[^/]+/, "");
};

const AccountSettingsPage = () => {
  const { user, updateUserProfilePicture } = useAuth();
  const {
    message: toastMessage,
    isVisible: toastMessageIsVisible,
    showToastMessage,
    closeToastMessage,
  } = useToastMessage("", false);

  const [pictureLoading, setPictureLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix_name: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>(
    {},
  );

  const [usernameForm, setUsernameForm] = useState<UsernameFormData>({
    new_username: "",
    current_password: "",
  });
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameErrors, setUsernameErrors] = useState<
    Record<string, string[]>
  >({});
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<
    Record<string, string[]>
  >({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        middle_name: user.middle_name || "",
        last_name: user.last_name || "",
        suffix_name: user.suffix_name || "",
      });
      if (user.profile_picture_url) {
        // FIX: Convert to relative path + cache-bust so Vite proxy forwards
        // it correctly and browser always fetches the latest image
        const base = toRelativeStorageUrl(user.profile_picture_url).split(
          "?",
        )[0];
        setPreviewUrl(`${base}?t=${Date.now()}`);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [user]);

  const handleUpload = async (file: File) => {
    setPictureLoading(true);
    try {
      const response = await AccountService.uploadProfilePicture(file);
      if (response.status === 200) {
        const rawUrl: string = response.data.profile_picture_url;
        // FIX: Use relative path so Vite proxy handles the request
        const url = `${toRelativeStorageUrl(rawUrl).split("?")[0]}?t=${Date.now()}`;
        updateUserProfilePicture(url);
        setPreviewUrl(url);
        showToastMessage(response.data.message || "Profile picture updated!");
      }
    } catch (error: any) {
      showToastMessage(
        error.response?.data?.message || "Failed to upload profile picture.",
      );
    } finally {
      setPictureLoading(false);
    }
  };

  const handleRemove = async () => {
    setPictureLoading(true);
    try {
      const response = await AccountService.removeProfilePicture();
      if (response.status === 200) {
        updateUserProfilePicture(null);
        setPreviewUrl(null);
        showToastMessage(response.data.message || "Profile picture removed.");
      }
    } catch (error: any) {
      showToastMessage(
        error.response?.data?.message || "Failed to remove profile picture.",
      );
    } finally {
      setPictureLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileErrors({});
    try {
      const response = await AccountService.updateProfile(profileForm);
      if (response.status === 200) {
        showToastMessage(
          response.data.message || "Profile updated successfully!",
        );
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...currentUser, ...profileForm }),
        );
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error: any) {
      if (error.response?.data?.errors)
        setProfileErrors(error.response.data.errors);
      else
        showToastMessage(
          error.response?.data?.message || "Failed to update profile",
        );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameErrors({});
    try {
      const response = await AccountService.updateUsername(usernameForm);
      if (response.status === 200) {
        showToastMessage(
          response.data.message || "Username updated successfully!",
        );
        setShowUsernameModal(false);
        setUsernameForm({ new_username: "", current_password: "" });
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            username: usernameForm.new_username,
          }),
        );
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error: any) {
      if (error.response?.data?.errors)
        setUsernameErrors(error.response.data.errors);
      else
        showToastMessage(
          error.response?.data?.message || "Failed to update username",
        );
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordErrors({});
    try {
      const response = await AccountService.changePassword(passwordForm);
      if (response.status === 200) {
        showToastMessage(
          response.data.message || "Password changed successfully!",
        );
        setShowPasswordModal(false);
        setPasswordForm({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      }
    } catch (error: any) {
      if (error.response?.data?.errors)
        setPasswordErrors(error.response.data.errors);
      else
        showToastMessage(
          error.response?.data?.message || "Failed to change password",
        );
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = `${user?.first_name?.charAt(0) ?? ""}${user?.last_name?.charAt(0) ?? ""}`;

  const inputClass =
    "w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#4A7BA7] focus:border-[#4A7BA7] transition-all text-sm font-medium bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <>
      <ToastMessage
        message={toastMessage}
        isVisible={toastMessageIsVisible}
        onClose={closeToastMessage}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4A7BA7] via-[#3d6a8f] to-[#4A7BA7] shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  Account Settings
                </h1>
                <p className="text-blue-100 text-sm sm:text-base mt-1 font-medium">
                  Manage your profile and security preferences
                </p>
              </div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30 overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <img
                    key={previewUrl}
                    src={previewUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {initials}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-100 dark:border-white/5 p-6 sticky top-6 transition-colors duration-300">
                <div className="text-center">
                  <ProfilePictureUpload
                    currentImageUrl={previewUrl}
                    initials={initials}
                    onUpload={handleUpload}
                    onRemove={handleRemove}
                    isLoading={pictureLoading}
                  />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-3">
                    @{user?.username}
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                      user?.role === "Admin"
                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                        : user?.role === "Coach"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300"
                          : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                    {user?.role}
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
                  {[
                    { label: "Gender", value: user?.gender?.gender || "N/A" },
                    { label: "Age", value: `${user?.age} years` },
                    {
                      label: "Birth Date",
                      value: new Date(
                        user?.birth_date || "",
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }),
                    },
                    {
                      label: "User ID",
                      value: `#${user?.user_id}`,
                      mono: true,
                    },
                  ].map(({ label, value, mono }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {label}
                      </span>
                      <span
                        className={`text-sm font-bold text-gray-900 dark:text-white ${mono ? "font-mono" : ""}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
                <div className="bg-gradient-to-r from-[#4A7BA7]/10 via-[#3d6a8f]/10 to-[#4A7BA7]/10 dark:from-[#4A7BA7]/10 dark:to-[#4A7BA7]/10 px-6 py-4 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4A7BA7] shadow-md">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Profile Information
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update your personal details
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {(
                      [
                        {
                          key: "first_name",
                          label: "First Name",
                          required: true,
                          placeholder: "",
                        },
                        {
                          key: "middle_name",
                          label: "Middle Name",
                          required: false,
                          placeholder: "",
                        },
                        {
                          key: "last_name",
                          label: "Last Name",
                          required: true,
                          placeholder: "",
                        },
                        {
                          key: "suffix_name",
                          label: "Suffix Name",
                          required: false,
                          placeholder: "Jr., Sr., III",
                        },
                      ] as const
                    ).map(({ key, label, required, placeholder }) => (
                      <div key={key}>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          {label}{" "}
                          {required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          value={profileForm[key]}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              [key]: e.target.value,
                            })
                          }
                          className={inputClass}
                          required={required}
                          placeholder={placeholder}
                        />
                        {profileErrors[key] && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            {profileErrors[key][0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#4A7BA7] to-[#3d6a8f] text-white rounded-xl hover:from-[#3d6a8f] hover:to-[#2f5570] font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      {profileLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Settings */}
              <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 px-6 py-4 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500 shadow-md">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Security Settings
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage your account security
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Username row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-[#4A7BA7]/10 via-[#3d6a8f]/10 to-[#4A7BA7]/10 dark:from-[#4A7BA7]/10 dark:to-[#4A7BA7]/10 rounded-xl border-2 border-[#4A7BA7]/20 dark:border-[#4A7BA7]/30 hover:border-[#4A7BA7]/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4A7BA7] shadow-md">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          Username
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          @{user?.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUsernameModal(true)}
                      className="px-4 py-2 bg-[#4A7BA7] text-white rounded-lg hover:bg-[#3d6a8f] font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Change
                    </button>
                  </div>

                  {/* Password row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 rounded-xl border-2 border-green-100 dark:border-green-500/20 hover:border-green-200 dark:hover:border-green-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 shadow-md">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          Password
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          ••••••••
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Username Modal */}
      <Modal
        isOpen={showUsernameModal}
        onClose={() => {
          setShowUsernameModal(false);
          setUsernameForm({ new_username: "", current_password: "" });
          setUsernameErrors({});
        }}
        showCloseButton
      >
        <div className="p-6 bg-white dark:bg-[#1a1f2e] transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#4A7BA7]/10 dark:bg-[#4A7BA7]/20">
              <svg
                className="w-6 h-6 text-[#4A7BA7]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Change Username
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your account username
              </p>
            </div>
          </div>

          <form onSubmit={handleUsernameUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                New Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={usernameForm.new_username}
                onChange={(e) =>
                  setUsernameForm({
                    ...usernameForm,
                    new_username: e.target.value,
                  })
                }
                className={inputClass}
                required
                minLength={6}
                maxLength={12}
                placeholder="Enter new username"
              />
              {usernameErrors.new_username && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {usernameErrors.new_username[0]}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                Must be 6-12 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={usernameForm.current_password}
                onChange={(e) =>
                  setUsernameForm({
                    ...usernameForm,
                    current_password: e.target.value,
                  })
                }
                className={inputClass}
                required
                placeholder="Confirm your password"
              />
              {usernameErrors.current_password && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {usernameErrors.current_password[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowUsernameModal(false);
                  setUsernameForm({ new_username: "", current_password: "" });
                  setUsernameErrors({});
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={usernameLoading}
                className="flex-1 px-4 py-2.5 bg-[#4A7BA7] text-white rounded-xl hover:bg-[#3d6a8f] font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {usernameLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Updating...
                  </span>
                ) : (
                  "Update Username"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({
            current_password: "",
            new_password: "",
            new_password_confirmation: "",
          });
          setPasswordErrors({});
        }}
        showCloseButton
      >
        <div className="p-6 bg-white dark:bg-[#1a1f2e] transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your account password
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      current_password: e.target.value,
                    })
                  }
                  className={`${inputClass} pr-12`}
                  required
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-[#4A7BA7] transition-colors p-1"
                >
                  <EyeIcon visible={showCurrentPassword} />
                </button>
              </div>
              {passwordErrors.current_password && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {passwordErrors.current_password[0]}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    })
                  }
                  className={`${inputClass} pr-12`}
                  required
                  minLength={6}
                  maxLength={12}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-[#4A7BA7] transition-colors p-1"
                >
                  <EyeIcon visible={showNewPassword} />
                </button>
              </div>
              {passwordErrors.new_password && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {passwordErrors.new_password[0]}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                Must be 6-12 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password_confirmation: e.target.value,
                    })
                  }
                  className={`${inputClass} pr-12`}
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-[#4A7BA7] transition-colors p-1"
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
              {passwordErrors.new_password_confirmation && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {passwordErrors.new_password_confirmation[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({
                    current_password: "",
                    new_password: "",
                    new_password_confirmation: "",
                  });
                  setPasswordErrors({});
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {passwordLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Changing...
                  </span>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default AccountSettingsPage;
