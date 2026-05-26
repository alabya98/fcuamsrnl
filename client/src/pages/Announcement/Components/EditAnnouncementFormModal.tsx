import { useEffect, useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import AnnouncementService from "../../../services/AnnouncementService";
import type {
  AnnouncementColumns,
  AnnouncementFieldErrors,
} from "../../../interfaces/AnnouncementInterface";

interface EditAnnouncementFormModalProps {
  announcement: AnnouncementColumns | null;
  onAnnouncementUpdated: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const EditAnnouncementFormModal: FC<EditAnnouncementFormModalProps> = ({
  announcement,
  onAnnouncementUpdated,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [announcementType, setAnnouncementType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [priority, setPriority] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [errors, setErrors] = useState<AnnouncementFieldErrors>({});

  const handleUpdateAnnouncement = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!announcement || !announcement.announcement_id) {
        console.error("❌ No announcement or announcement_id available");
        return;
      }

      setLoadingUpdate(true);

      const payload = {
        title: title,
        content: content,
        announcement_type: announcementType,
        target_audience: targetAudience,
        priority: priority,
        publish_date: publishDate,
        expiry_date: expiryDate || null,
      };

      const res = await AnnouncementService.updateAnnouncement(
        announcement.announcement_id,
        payload
      );

      if (res.status === 200) {
        setErrors({});
        onAnnouncementUpdated(res.data.message);
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors || {};
        setErrors(validationErrors);
      } else {
        console.error(
          "❌ Unexpected server error occurred during updating announcement: ",
          error
        );
      }
    } finally {
      setLoadingUpdate(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && announcement) {
      setTitle(announcement.title || "");
      setContent(announcement.content || "");
      setAnnouncementType(announcement.announcement_type || "");
      setTargetAudience(announcement.target_audience || "");
      setPriority(announcement.priority || "");
      
      // ✅ FIX: Format publish_date properly
      if (announcement.publish_date) {
        const dateObj = new Date(announcement.publish_date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        setPublishDate(`${year}-${month}-${day}`);
      } else {
        setPublishDate("");
      }
      
      // ✅ FIX: Format expiry_date properly
      if (announcement.expiry_date) {
        const expiryObj = new Date(announcement.expiry_date);
        const year = expiryObj.getFullYear();
        const month = String(expiryObj.getMonth() + 1).padStart(2, '0');
        const day = String(expiryObj.getDate()).padStart(2, '0');
        setExpiryDate(`${year}-${month}-${day}`);
      } else {
        setExpiryDate("");
      }
    }
  }, [isOpen, announcement]);

  if (!announcement) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
      <form onSubmit={handleUpdateAnnouncement} className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Edit Announcement Form
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <div className="col-span-1 lg:col-span-2">
              <div className="mb-2 sm:mb-3">
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
            </div>

            <div className="col-span-1 lg:col-span-2">
              <div className="mb-2 sm:mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.content ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter announcement content..."
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.content[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
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
            </div>

            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Target Audience"
                  name="target_audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  required
                  errors={errors.target_audience}
                >
                  <option value="">Select Audience</option>
                  <option value="All">All</option>
                  <option value="Athletes">Athletes</option>
                  <option value="Coaches">Coaches</option>
                  <option value="Staff">Staff</option>
                </FloatingLabelSelect>
              </div>
            </div>

            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
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
            </div>

            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
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

            <div className="col-span-1 lg:col-span-2">
              <div className="mb-2 sm:mb-3">
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
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingUpdate && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Update Announcement"
            loading={loadingUpdate}
            loadingLabel="Updating..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditAnnouncementFormModal;