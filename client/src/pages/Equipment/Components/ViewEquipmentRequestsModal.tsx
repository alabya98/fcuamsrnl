import { useEffect, useState, type FC } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/button/CloseButton";
import EquipmentRequestService from "../../../services/EquipmentRequestService";
import type { EquipmentRequestColumns } from "../../../interfaces/EquipmentRequestInterface";
import PrintableEquipmentRequestList from "./PrintableEquipmentRequestList";
import EquipmentRequestPrintButton from "../../../components/button/EquipmentRequestPrintButton";

interface ViewEquipmentRequestsModalProps {
  onRequestProcessed: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "all" | "print";
}

type TabType = "all" | "print";

const ViewEquipmentRequestsModal: FC<ViewEquipmentRequestsModalProps> = ({
  onRequestProcessed,
  refreshKey,
  isOpen,
  onClose,
  initialTab = "all",
}) => {
  const [requests, setRequests] = useState<EquipmentRequestColumns[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [adminNotes, setAdminNotes] = useState<{ [key: number]: string }>({});
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const approvedRequests = requests.filter((r) => r.status === "Approved");
  const unprintedApproved = approvedRequests.filter((r) => !r.is_printed);
  const printedApproved = approvedRequests.filter((r) => r.is_printed);

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
    if (activeTab === "print") {
      const defaultSelected = new Set(
        unprintedApproved.map((r) => r.request_id),
      );
      setSelectedIds(defaultSelected);
    }
  }, [activeTab, requests]);

  const handleApprove = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      const res = await EquipmentRequestService.approveRequest(requestId, {
        admin_notes: adminNotes[requestId] || "",
      });
      if (res.status === 200) {
        onRequestProcessed(res.data.message);
        loadRequests();
        refreshKey();
      }
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      if (!adminNotes[requestId]) {
        alert("Please provide a reason for rejection");
        return;
      }
      setProcessingId(requestId);
      const res = await EquipmentRequestService.rejectRequest(requestId, {
        admin_notes: adminNotes[requestId],
      });
      if (res.status === 200) {
        onRequestProcessed(res.data.message);
        loadRequests();
        refreshKey();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleSelect = (requestId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(requestId)) {
        next.delete(requestId);
      } else {
        next.add(requestId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(approvedRequests.map((r) => r.request_id)));
  };

  const handleSelectUnprintedOnly = () => {
    setSelectedIds(new Set(unprintedApproved.map((r) => r.request_id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const selectedRequests = approvedRequests.filter((r) =>
    selectedIds.has(r.request_id),
  );

  const handleAfterPrint = async () => {
    try {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      await EquipmentRequestService.markAsPrinted(ids);
      onRequestProcessed(`${ids.length} request(s) marked as printed`);
      setShowPrintPreview(false);
      loadRequests();
      refreshKey();
    } catch (error) {
      console.error("Error marking as printed:", error);
    }
  };

  const handleOpenPrintPreview = () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one request to print.");
      return;
    }
    setShowPrintPreview(true);
  };

  // Reset to initialTab every time the modal opens
  useEffect(() => {
    if (isOpen) {
      loadRequests();
      setActiveTab(initialTab);
      setFilterStatus("All");
    }
  }, [isOpen, initialTab]);

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

  const formatCoachName = (coach: any) => {
    if (!coach) return "Unknown Coach";
    let name = coach.first_name;
    if (coach.middle_name) name += ` ${coach.middle_name.charAt(0)}.`;
    name += ` ${coach.last_name}`;
    return name;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-200">
            <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
              Equipment Requests
            </h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-3 sm:px-4">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setActiveTab("print")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "print"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Print Approved
                {unprintedApproved.length > 0 && (
                  <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                    {unprintedApproved.length} new
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : activeTab === "all" ? (
              /* ── ALL REQUESTS TAB ── */
              <>
                <div className="mb-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="All">
                      All Requests ({requests.length})
                    </option>
                    <option value="Pending">
                      Pending (
                      {requests.filter((r) => r.status === "Pending").length})
                    </option>
                    <option value="Approved">
                      Approved (
                      {requests.filter((r) => r.status === "Approved").length})
                    </option>
                    <option value="Rejected">
                      Rejected (
                      {requests.filter((r) => r.status === "Rejected").length})
                    </option>
                  </select>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Requests Found
                    </h3>
                    <p className="text-gray-600">
                      {filterStatus !== "All"
                        ? `No ${filterStatus.toLowerCase()} requests`
                        : "No equipment requests yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <div
                        key={request.request_id}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {request.equipment_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {request.sport} • Qty:{" "}
                              {request.quantity_requested}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {request.status === "Approved" &&
                              request.is_printed && (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                  Printed ×{request.print_count}
                                </span>
                              )}
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}
                            >
                              {request.status}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">
                            <strong>Requested by:</strong>{" "}
                            {formatCoachName(request.coach)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            Reason:
                          </p>
                          <p className="text-sm text-gray-600">
                            {request.reason}
                          </p>
                        </div>

                        {request.admin_notes && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              Admin Notes:
                            </p>
                            <p className="text-sm text-blue-800">
                              {request.admin_notes}
                            </p>
                            {request.reviewer && (
                              <p className="text-xs text-blue-600 mt-2">
                                Reviewed by {request.reviewer.first_name}{" "}
                                {request.reviewer.last_name} on{" "}
                                {new Date(
                                  request.reviewed_at!,
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Print history */}
                        {request.status === "Approved" &&
                          request.is_printed &&
                          request.printer && (
                            <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <p className="text-xs text-purple-700 font-semibold mb-1">
                                Print History
                              </p>
                              <p className="text-xs text-purple-600">
                                Last printed by {request.printer.first_name}{" "}
                                {request.printer.last_name}
                              </p>
                              <p className="text-xs text-purple-600">
                                {formatDate(request.printed_at!)} • Printed{" "}
                                {request.print_count}×
                              </p>
                            </div>
                          )}

                        {request.status === "Pending" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Notes (optional for approval, required for
                                rejection)
                              </label>
                              <textarea
                                value={adminNotes[request.request_id] || ""}
                                onChange={(e) =>
                                  setAdminNotes({
                                    ...adminNotes,
                                    [request.request_id]: e.target.value,
                                  })
                                }
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Add notes about this request..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleApprove(request.request_id)
                                }
                                disabled={processingId === request.request_id}
                                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                              >
                                {processingId === request.request_id
                                  ? "Processing..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(request.request_id)}
                                disabled={processingId === request.request_id}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                              >
                                {processingId === request.request_id
                                  ? "Processing..."
                                  : "Reject"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* ── PRINT APPROVED TAB ── */
              <>
                {approvedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Approved Requests
                    </h3>
                    <p className="text-gray-600 text-sm">
                      There are no approved requests to print yet.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Selection controls */}
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {selectedIds.size} of {approvedRequests.length}{" "}
                            selected for printing
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {unprintedApproved.length} unprinted •{" "}
                            {printedApproved.length} previously printed
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={handleSelectUnprintedOnly}
                            className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            New Only
                          </button>
                          <button
                            onClick={handleSelectAll}
                            className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Select All
                          </button>
                          <button
                            onClick={handleDeselectAll}
                            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-white border-2 border-green-400"></div>
                        <span>New (pre-checked)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-white border-2 border-gray-300"></div>
                        <span>Previously printed (unchecked by default)</span>
                      </div>
                    </div>

                    {/* Request list with checkboxes */}
                    <div className="space-y-3">
                      {approvedRequests.map((request) => {
                        const isSelected = selectedIds.has(request.request_id);
                        const isPrinted = request.is_printed;

                        return (
                          <div
                            key={request.request_id}
                            onClick={() =>
                              handleToggleSelect(request.request_id)
                            }
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-blue-400 bg-blue-50"
                                : isPrinted
                                  ? "border-gray-200 bg-gray-50 opacity-75"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            {/* Checkbox */}
                            <div className="flex-shrink-0 mt-0.5">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-blue-500 border-blue-500"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-900 text-sm">
                                  {request.equipment_name}
                                </p>
                                {isPrinted ? (
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                                    Printed ×{request.print_count}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {request.sport} • Qty:{" "}
                                {request.quantity_requested} •{" "}
                                {formatCoachName(request.coach)}
                              </p>
                              {isPrinted && request.printer && (
                                <p className="text-xs text-purple-600 mt-1">
                                  Last printed by {request.printer.first_name}{" "}
                                  {request.printer.last_name} on{" "}
                                  {formatDate(request.printed_at!)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex justify-between items-center">
            <div>
              {activeTab === "print" && approvedRequests.length > 0 && (
                <p className="text-xs text-gray-500">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} request(s) will be printed`
                    : "Select requests above to enable printing"}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {activeTab === "print" && approvedRequests.length > 0 && (
                <button
                  onClick={handleOpenPrintPreview}
                  disabled={selectedIds.size === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
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
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Selected ({selectedIds.size})
                </button>
              )}
              <CloseButton label="Close" onClose={onClose} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <Modal
          isOpen={showPrintPreview}
          onClose={() => setShowPrintPreview(false)}
          size="large"
        >
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-gray-200">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                  Print Preview
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedRequests.length} request(s) selected for printing
                </p>
                {selectedRequests.some((r) => r.is_printed) && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    ⚠ {selectedRequests.filter((r) => r.is_printed).length}{" "}
                    previously printed request(s) included
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
                >
                  Back
                </button>
                <EquipmentRequestPrintButton
                  requests={selectedRequests}
                  documentTitle={`Approved_Equipment_Requests_${
                    new Date().toISOString().split("T")[0]
                  }`}
                  onAfterPrint={handleAfterPrint}
                />
              </div>
            </div>
            <div className="border-2 border-gray-300 rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto bg-white shadow-lg">
              <PrintableEquipmentRequestList
                requests={selectedRequests}
                title="Approved Equipment Requests for Procurement"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ViewEquipmentRequestsModal;
