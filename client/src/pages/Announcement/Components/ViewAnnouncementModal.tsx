import { type FC } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/button/CloseButton";
import type { AnnouncementColumns } from "../../../interfaces/AnnouncementInterface";

interface ViewAnnouncementModalProps {
  announcement: AnnouncementColumns | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewAnnouncementModal: FC<ViewAnnouncementModalProps> = ({
  announcement,
  isOpen,
  onClose,
}) => {
  if (!announcement) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Urgent":
        return "bg-red-100 text-red-700";
      case "Event":
        return "bg-blue-100 text-blue-700";
      case "Reminder":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            {announcement.title}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${getTypeColor(announcement.announcement_type)}`}>
              {announcement.announcement_type}
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${getPriorityColor(announcement.priority)}`}>
              {announcement.priority} Priority
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${
              announcement.is_published 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-100 text-gray-700"
            }`}>
              {announcement.is_published ? "Published" : "Draft"}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-4">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Target Audience:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">
                <span className="inline-flex px-2 py-1 text-xs font-bold rounded bg-purple-100 text-purple-700">
                  {announcement.target_audience}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Publish Date:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">
                {new Date(announcement.publish_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {announcement.expiry_date && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Expiry Date:</span>
                <span className="text-sm font-medium text-gray-900 col-span-2">
                  {new Date(announcement.expiry_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-3">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Content:</h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
              {announcement.content}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex justify-end">
          <CloseButton label="Close" onClose={onClose} />
        </div>
      </div>
    </Modal>
  );
};

export default ViewAnnouncementModal;