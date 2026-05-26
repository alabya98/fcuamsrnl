import { useState, useEffect, type FC, type FormEvent } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import AnnouncementService from "../../../services/AnnouncementService";
import type { AnnouncementFieldErrors } from "../../../interfaces/AnnouncementInterface";

interface AddAnnouncementFormModalProps {
  onAnnouncementAdded: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const AddAnnouncementFormModal: FC<AddAnnouncementFormModalProps> = ({
  onAnnouncementAdded,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [loadingStore, setLoadingStore] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [announcementType, setAnnouncementType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [priority, setPriority] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [errors, setErrors] = useState<AnnouncementFieldErrors>({});

  useEffect(() => {
    if (user?.role === 'Coach' && isOpen) {
      setTargetAudience('Athletes');
    }
  }, [user, isOpen]);

  const handleStoreAnnouncement = async (e: FormEvent) => {
    try {
      e.preventDefault();

      setLoadingStore(true);

      const payload = {
        title: title,
        content: content,
        announcement_type: announcementType,
        target_audience: targetAudience,
        priority: priority,
        publish_date: publishDate,
        expiry_date: expiryDate || null,
      };

      const res = await AnnouncementService.storeAnnouncement(payload);

      if (res.status === 200) {
        onAnnouncementAdded(res.data.message);

        setTitle("");
        setContent("");
        setAnnouncementType("");
        setTargetAudience("");
        setPriority("");
        setPublishDate("");
        setExpiryDate("");
        setErrors({});

        refreshKey();
        onClose();
      } else {
        console.error(
          "Unexpected status error occurred during adding announcement: ",
          res.status
        );
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.log(
          "Unexpected server error occurred during adding announcement: ",
          error
        );
      }
    } finally {
      setLoadingStore(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <form onSubmit={handleStoreAnnouncement} className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Add Announcement Form
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <FloatingLabelInput
                label="Title"
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                errors={errors.title}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter announcement content..."
              />
              {errors.content && errors.content.length > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.content[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <FloatingLabelSelect
                  label="Announcement Type"
                  name="announcement_type"
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value)}
                  required
                  errors={errors.announcement_type}
                >
                  <option value="">Select Type</option>
                  <option value="General">General</option>
                  <option value="Event">Event</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Reminder">Reminder</option>
                </FloatingLabelSelect>
              </div>

              <div>
                <FloatingLabelSelect
                  label="Target Audience"
                  name="target_audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  required
                  disabled={user?.role === 'Coach'}
                  errors={errors.target_audience}
                >
                  <option value="">Select Audience</option>
                  {user?.role === 'Admin' ? (
                    <>
                      <option value="All">Everyone</option>
                      <option value="Athletes">Athletes</option>
                      <option value="Coaches">Coaches</option>
                    </>
                  ) : (
                    <option value="Athletes">Athletes (My Sport)</option>
                  )}
                </FloatingLabelSelect>
                {user?.role === 'Coach' && (
                  <p className="text-xs text-gray-500 mt-1">
                    As a coach, you can only post announcements to athletes in your sport
                  </p>
                )}
              </div>

              <div>
                <FloatingLabelSelect
                  label="Priority"
                  name="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                  errors={errors.priority}
                >
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </FloatingLabelSelect>
              </div>

              <div>
                <FloatingLabelInput
                  label="Publish Date"
                  type="date"
                  name="publish_date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  required
                  errors={errors.publish_date}
                />
              </div>
            </div>

            <div>
              <FloatingLabelInput
                label="Expiry Date (Optional)"
                type="date"
                name="expiry_date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                errors={errors.expiry_date}
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingStore && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Save Announcement"
            loading={loadingStore}
            loadingLabel="Saving..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddAnnouncementFormModal;