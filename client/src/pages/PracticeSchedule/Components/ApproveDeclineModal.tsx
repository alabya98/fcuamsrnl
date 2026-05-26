import { useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import PracticeScheduleService from "../../../services/PracticeScheduleService";
import type { PracticeScheduleColumns } from "../../../interfaces/PracticeScheduleInterface";

interface ApproveDeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: PracticeScheduleColumns | null;
  actionType: 'approve' | 'decline';
  onSuccess: (message: string) => void;
}

const ApproveDeclineModal: FC<ApproveDeclineModalProps> = ({
  isOpen,
  onClose,
  schedule,
  actionType,
  onSuccess,
}) => {
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isApprove = actionType === 'approve';

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();
      
      if (!schedule) return;

      if (!isApprove && !adminNotes.trim()) {
        setError("Please provide a reason for declining.");
        return;
      }

      setLoading(true);
      setError("");

      const data = { admin_notes: adminNotes };

      const res = isApprove 
        ? await PracticeScheduleService.approvePracticeSchedule(schedule.practice_schedule_id, data)
        : await PracticeScheduleService.declinePracticeSchedule(schedule.practice_schedule_id, data);

      if (res.status === 200) {
        onSuccess(res.data.message);
        setAdminNotes("");
        onClose();
      }
    } catch (error: any) {
      console.error("Error processing schedule:", error);
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCoachFullNameFormat = () => {
    if (!schedule?.coach) return "N/A";
    const coach = schedule.coach;
    let fullName = "";
    if (coach.middle_name) {
      fullName = `${coach.first_name} ${coach.middle_name.charAt(0)}. ${coach.last_name}`;
    } else {
      fullName = `${coach.first_name} ${coach.last_name}`;
    }
    if (coach.suffix_name) {
      fullName += ` ${coach.suffix_name}`;
    }
    return fullName;
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!schedule) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
      <form onSubmit={handleSubmit}>
        <h1 className={`text-2xl border-b border-gray-100 p-4 font-semibold mb-4 ${
          isApprove ? 'text-green-700' : 'text-red-700'
        }`}>
          {isApprove ? 'Approve' : 'Decline'} Practice Schedule
        </h1>
        
        <div className="p-4 border-b border-gray-100 mb-4">
          <p className="text-gray-700 mb-4">
            {isApprove 
              ? 'Are you sure you want to approve this practice schedule? Athletes will be able to see it.'
              : 'Please provide a reason for declining this practice schedule request.'}
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
            <div className="flex">
              <span className="font-semibold text-gray-600 w-32">Coach:</span>
              <span className="text-gray-800">{handleCoachFullNameFormat()}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-32">Venue:</span>
              <span className="text-gray-800">{schedule.venue}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-32">Date:</span>
              <span className="text-gray-800">{formatDate(schedule.practice_date)}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-32">Time:</span>
              <span className="text-gray-800">
                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
              </span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-32">Sport:</span>
              <span className="text-gray-800">{schedule.sport}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-32">Players:</span>
              <span className="text-gray-800">{schedule.total_players}</span>
            </div>
            {schedule.notes && (
              <div className="flex">
                <span className="font-semibold text-gray-600 w-32">Notes:</span>
                <span className="text-gray-800">{schedule.notes}</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${
              !isApprove ? 'text-red-700' : 'text-gray-700'
            }`}>
              {isApprove ? 'Admin Notes (Optional)' : 'Reason for Declining *'}
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              required={!isApprove}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                !isApprove 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder={isApprove 
                ? "Add any notes for the coach (optional)..." 
                : "Please explain why this request is being declined..."}
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 pb-4">
          {!loading && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            label={isApprove ? "Approve Schedule" : "Decline Schedule"}
            loading={loading}
            loadingLabel={isApprove ? "Approving..." : "Declining..."}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ApproveDeclineModal;