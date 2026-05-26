import { useEffect, useState, type FC } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/button/CloseButton";
import EquipmentRequestService from "../../../services/EquipmentRequestService";
import type { EquipmentRequestColumns } from "../../../interfaces/EquipmentRequestInterface";

interface MyRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyRequestsModal: FC<MyRequestsModalProps> = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState<EquipmentRequestColumns[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await EquipmentRequestService.loadRequests();
      if (res.status === 200) {
        setRequests(res.data.requests);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const filteredRequests = requests.filter((req) => {
    if (filterStatus === "All") return true;
    return req.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "Approved":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "Rejected":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-[#396B99] to-[#2d5577]">
          <h1 className="text-xl px-4 py-4 font-bold text-white">
            My Equipment Requests
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Filter */}
          <div className="mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm hover:shadow-md transition-all"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner mx-auto">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No Requests Found
              </h3>
              <p className="text-gray-400">
                {filterStatus !== "All"
                  ? `No ${filterStatus.toLowerCase()} requests`
                  : "You haven't submitted any equipment requests yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.request_id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {request.equipment_name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
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
                              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                            />
                          </svg>
                          Qty: {request.quantity_requested}
                        </span>
                        <span className="flex items-center gap-1">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-2 shadow-sm ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </div>

                  {/* Reason */}
                  <div className="mb-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm font-bold text-gray-700 mb-2">
                      Reason for Request:
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {request.reason}
                    </p>
                  </div>

                  {/* Admin Notes (if exists) */}
                  {request.admin_notes && (
                    <div
                      className={`p-4 rounded-xl border-2 ${
                        request.status === "Approved"
                          ? "bg-green-50 border-green-300"
                          : "bg-red-50 border-red-300"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <svg
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            request.status === "Approved"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-bold mb-1 ${
                              request.status === "Approved"
                                ? "text-green-900"
                                : "text-red-900"
                            }`}
                          >
                            Admin Response:
                          </p>
                          <p
                            className={`text-sm leading-relaxed ${
                              request.status === "Approved"
                                ? "text-green-800"
                                : "text-red-800"
                            }`}
                          >
                            {request.admin_notes}
                          </p>
                        </div>
                      </div>
                      {request.reviewer && request.reviewed_at && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-opacity-30">
                          <svg
                            className={`w-4 h-4 ${
                              request.status === "Approved"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
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
                          <p
                            className={`text-xs ${
                              request.status === "Approved"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            Reviewed by {request.reviewer.first_name}{" "}
                            {request.reviewer.last_name} on{" "}
                            {new Date(request.reviewed_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pending status message */}
                  {request.status === "Pending" && (
                    <div className="mt-3 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm text-yellow-800 font-medium">
                          Your request is pending admin review. You will be
                          notified once it's processed.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
          <p className="text-sm text-gray-600 font-medium">
            Showing{" "}
            <span className="font-bold text-gray-900">
              {filteredRequests.length}
            </span>{" "}
            of <span className="font-bold text-gray-900">{requests.length}</span>{" "}
            requests
          </p>
          <CloseButton label="Close" onClose={onClose} />
        </div>
      </div>
    </Modal>
  );
};

export default MyRequestsModal;