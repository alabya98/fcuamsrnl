import { useEffect, useState, type FC } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import EventService from "../../../services/EventService";
import PrintEventModal from "./PrintEventModal";
import type { EventColumns } from "../../../interfaces/EventInterface";

interface EventListProps {
  onAddEvent: () => void;
  onEditEvent: (event: EventColumns) => void;
  onDeleteEvent: (event: EventColumns) => void;
  refreshKey: boolean;
}

type CalendarView = "month" | "week" | "list";
type EventWithRole = EventColumns & { _dateRole: "start" | "end" };

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EventList: FC<EventListProps> = ({
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  refreshKey,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventColumns[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sportFilter, setSportFilter] = useState("All Sports");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventColumns | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedEventForPrint, setSelectedEventForPrint] =
    useState<EventColumns | null>(null);

  const handleLoadEvents = async () => {
    try {
      setLoading(true);
      const res = await EventService.loadEvents();
      if (res.status === 200) setEvents(res.data.events);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPrintModal = (event: EventColumns) => {
    setSelectedEventForPrint(event);
    setIsPrintModalOpen(true);
    setSelectedEvent(null);
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedEventForPrint(null);
  };

  useEffect(() => {
    handleLoadEvents();
  }, [refreshKey]);

  const filteredEvents = events.filter((event) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      event.event_name.toLowerCase().includes(query) ||
      event.sport.toLowerCase().includes(query) ||
      event.venue.toLowerCase().includes(query) ||
      event.event_type.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "All Status" || event.status === statusFilter;
    const matchesSport =
      sportFilter === "All Sports" || event.sport === sportFilter;
    return matchesSearch && matchesStatus && matchesSport;
  });

  const uniqueSports = Array.from(new Set(events.map((e) => e.sport))).sort();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (timeString: string) =>
    new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Ongoing":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Founders":
        return "bg-purple-100 text-purple-800";
      case "CAPRISAA":
        return "bg-blue-100 text-blue-800";
      case "Nationals":
        return "bg-red-100 text-red-700";
      case "Regionals":
        return "bg-green-100 text-green-800";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const navigatePrev = () => {
    const d = new Date(currentDate);
    if (calendarView === "month") d.setMonth(d.getMonth() - 1);
    else if (calendarView === "week") d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const navigateNext = () => {
    const d = new Date(currentDate);
    if (calendarView === "month") d.setMonth(d.getMonth() + 1);
    else if (calendarView === "week") d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();
  const toDateStr = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getEventsForDate = (dateStr: string): EventWithRole[] => {
    const result: EventWithRole[] = [];
    filteredEvents.forEach((event) => {
      const isStart = event.event_date === dateStr;
      const hasRange = event.end_date && event.end_date !== event.event_date;
      const isEnd = hasRange && event.end_date === dateStr;
      if (isStart) result.push({ ...event, _dateRole: "start" });
      else if (isEnd) result.push({ ...event, _dateRole: "end" });
    });
    return result;
  };

  const getWeekDays = () => {
    const day = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays();

  const getHeaderLabel = () => {
    if (calendarView === "month")
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (calendarView === "week") {
      const first = weekDays[0],
        last = weekDays[6];
      if (first.getMonth() === last.getMonth())
        return `${MONTHS[first.getMonth()]} ${first.getFullYear()}`;
      return `${MONTHS[first.getMonth()]} – ${MONTHS[last.getMonth()]} ${last.getFullYear()}`;
    }
    return "All Events";
  };

  const today = new Date();
  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // ─── Month View ───────────────────────────────────────────────────────────────
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const cells: { day: number; currentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month - 1 < 0 ? 11 : month - 1;
      const y = month - 1 < 0 ? year - 1 : year;
      cells.push({ day: d, currentMonth: false, dateStr: toDateStr(y, m, d) });
    }
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({
        day: d,
        currentMonth: true,
        dateStr: toDateStr(year, month, d),
      });
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month + 1 > 11 ? 0 : month + 1;
      const y = month + 1 > 11 ? year + 1 : year;
      cells.push({ day: d, currentMonth: false, dateStr: toDateStr(y, m, d) });
    }

    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/10">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7" style={{ minHeight: "520px" }}>
          {cells.map((cell, idx) => {
            const cellEvents = getEventsForDate(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            return (
              <div
                key={idx}
                className={`border-b border-r border-gray-100 dark:border-white/5 p-1.5 min-h-[100px] transition-colors
                  ${
                    cell.currentMonth
                      ? "bg-white dark:bg-[#1a1f2e] hover:bg-blue-50/40 dark:hover:bg-blue-500/5"
                      : "bg-gray-50/60 dark:bg-[#141720]/60"
                  }
                  ${idx % 7 === 0 ? "border-l dark:border-l-white/5" : ""}`}
              >
                <div className="flex items-center justify-end mb-1">
                  <span
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                    ${
                      isToday
                        ? "bg-[#396B99] text-white"
                        : cell.currentMonth
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-300 dark:text-gray-600"
                    }`}
                  >
                    {cell.day}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {cellEvents.slice(0, 3).map((event) => {
                    const isEnd = event._dateRole === "end";
                    const isStart = event._dateRole === "start";
                    const hasRange =
                      event.end_date && event.end_date !== event.event_date;
                    const colorClass =
                      event.status === "Upcoming"
                        ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/30 border-l-2 border-blue-500"
                        : event.status === "Ongoing"
                          ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-500/30 border-l-2 border-green-500"
                          : event.status === "Completed"
                            ? "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15 border-l-2 border-gray-400 dark:border-gray-500"
                            : "bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/30 border-l-2 border-red-400";
                    return (
                      <button
                        key={`${event.event_id}-${cell.dateStr}`}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left text-xs px-1.5 py-0.5 rounded font-medium ${colorClass}`}
                      >
                        <span className="flex items-center gap-1 min-w-0">
                          {hasRange && isStart && (
                            <span className="inline-flex shrink-0 items-center bg-green-500 text-white text-[9px] font-bold px-1 py-0 rounded leading-tight">
                              START
                            </span>
                          )}
                          {hasRange && isEnd && (
                            <span className="inline-flex shrink-0 items-center bg-red-500 text-white text-[9px] font-bold px-1 py-0 rounded leading-tight">
                              END
                            </span>
                          )}
                          <span className="truncate">{event.event_name}</span>
                        </span>
                      </button>
                    );
                  })}
                  {cellEvents.length > 3 && (
                    <button
                      onClick={() => setSelectedEvent(cellEvents[3])}
                      className="text-xs text-[#396B99] dark:text-blue-400 font-semibold px-1.5 hover:underline"
                    >
                      +{cellEvents.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Week View ────────────────────────────────────────────────────────────────
  const renderWeekView = () => (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1a1f2e] z-10">
        {weekDays.map((day, i) => {
          const ds = toDateStr(
            day.getFullYear(),
            day.getMonth(),
            day.getDate(),
          );
          const isToday = ds === todayStr;
          return (
            <div
              key={i}
              className={`py-3 text-center border-r border-gray-100 dark:border-white/5 last:border-r-0 ${isToday ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {DAYS_OF_WEEK[day.getDay()]}
              </p>
              <p
                className={`text-lg font-bold mt-0.5 w-9 h-9 flex items-center justify-center rounded-full mx-auto
                ${isToday ? "bg-[#396B99] text-white" : "text-gray-800 dark:text-gray-200"}`}
              >
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 min-h-[480px]">
        {weekDays.map((day, i) => {
          const ds = toDateStr(
            day.getFullYear(),
            day.getMonth(),
            day.getDate(),
          );
          const dayEvents = getEventsForDate(ds);
          const isToday = ds === todayStr;
          return (
            <div
              key={i}
              className={`border-r border-gray-100 dark:border-white/5 last:border-r-0 p-2 space-y-1
              ${isToday ? "bg-blue-50/30 dark:bg-blue-500/5" : "bg-white dark:bg-[#1a1f2e] hover:bg-gray-50/50 dark:hover:bg-white/5"}`}
            >
              {dayEvents.length === 0 ? (
                <div className="h-full flex items-start justify-center pt-6">
                  <span className="text-gray-200 dark:text-gray-700 text-xs">
                    —
                  </span>
                </div>
              ) : (
                dayEvents.map((event) => {
                  const hasRange =
                    event.end_date && event.end_date !== event.event_date;
                  const isEnd = event._dateRole === "end";
                  const isStart = event._dateRole === "start";
                  const colorClass =
                    event.status === "Upcoming"
                      ? "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30"
                      : event.status === "Ongoing"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-500/30"
                        : event.status === "Completed"
                          ? "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15"
                          : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30";
                  return (
                    <button
                      key={`${event.event_id}-${ds}`}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded-lg font-medium shadow-sm transition-all hover:shadow-md ${colorClass}`}
                    >
                      <span className="flex items-center gap-1 mb-0.5">
                        {hasRange && isStart && (
                          <span className="inline-flex shrink-0 items-center bg-green-500 text-white text-[9px] font-bold px-1 py-0 rounded leading-tight">
                            START
                          </span>
                        )}
                        {hasRange && isEnd && (
                          <span className="inline-flex shrink-0 items-center bg-red-500 text-white text-[9px] font-bold px-1 py-0 rounded leading-tight">
                            END
                          </span>
                        )}
                        <span className="truncate font-semibold">
                          {event.event_name}
                        </span>
                      </span>
                      <p className="opacity-75 truncate">
                        {formatTime(event.start_time)}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── List View ────────────────────────────────────────────────────────────────
  const renderListView = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-white/10"></div>
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-[#396B99] absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Loading events...
            </p>
          </div>
        </div>
      );
    }
    if (filteredEvents.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400 dark:text-gray-500"
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
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-bold text-lg">
              No events found
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        </div>
      );
    }

    const grouped: Record<string, EventColumns[]> = {};
    [...filteredEvents]
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .forEach((event) => {
        const d = new Date(event.event_date);
        const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(event);
      });

    return (
      <div className="flex-1 overflow-auto px-4 py-4 space-y-6">
        {Object.entries(grouped).map(([monthLabel, monthEvents]) => (
          <div key={monthLabel}>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
              {monthLabel}
            </h3>
            <div className="space-y-2">
              {monthEvents.map((event) => {
                const startD = new Date(event.event_date);
                const hasRange =
                  event.end_date && event.end_date !== event.event_date;
                const endD = hasRange ? new Date(event.end_date!) : null;
                const startDay = startD.getDate();
                const startDayName = DAYS_OF_WEEK[startD.getDay()];
                const startMonth = MONTHS[startD.getMonth()].slice(0, 3);
                const endDay = endD ? endD.getDate() : null;
                const endMonth = endD
                  ? MONTHS[endD.getMonth()].slice(0, 3)
                  : null;

                return (
                  <button
                    key={event.event_id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full text-left flex items-stretch gap-4 bg-white dark:bg-[#1e2433] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 hover:border-[#396B99] dark:hover:border-blue-500/50 hover:shadow-md dark:hover:shadow-black/20 transition-all group"
                  >
                    {hasRange ? (
                      <div className="flex flex-col items-center justify-center shrink-0 min-w-[80px]">
                        <div className="flex items-center gap-1 text-[#396B99] dark:text-blue-400">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                              {startMonth}
                            </span>
                            <span className="text-xl font-extrabold leading-tight">
                              {startDay}
                            </span>
                          </div>
                          <span className="text-gray-300 dark:text-gray-600 font-light text-lg mx-0.5">
                            –
                          </span>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                              {endMonth}
                            </span>
                            <span className="text-xl font-extrabold leading-tight">
                              {endDay}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                          Multi-day
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-12 shrink-0">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
                          {startDayName}
                        </span>
                        <span className="text-2xl font-extrabold text-[#396B99] dark:text-blue-400 leading-tight">
                          {startDay}
                        </span>
                      </div>
                    )}
                    <div className="w-px bg-gray-200 dark:bg-white/10 group-hover:bg-[#396B99] dark:group-hover:bg-blue-500 transition-colors shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 dark:text-white text-sm group-hover:text-[#396B99] dark:group-hover:text-blue-400 transition-colors truncate">
                          {event.event_name}
                        </p>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${getStatusBadgeColor(event.status)}`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {formatTime(event.start_time)} –{" "}
                          {formatTime(event.end_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {event.venue}
                        </span>
                        <span
                          className={`px-2 py-0 rounded-full font-semibold ${getTypeBadgeColor(event.event_type)}`}
                        >
                          {event.event_type}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Event Detail Popup ───────────────────────────────────────────────────────
  const renderEventDetail = () => {
    if (!selectedEvent) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={() => setSelectedEvent(null)}
      >
        <div
          className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] px-6 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-white font-bold text-lg leading-tight truncate">
                  {selectedEvent.event_name}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeColor(selectedEvent.status)}`}
                  >
                    {selectedEvent.status}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getTypeBadgeColor(selectedEvent.event_type)}`}
                  >
                    {selectedEvent.event_type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-white/70 hover:text-white transition-colors shrink-0 mt-0.5"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-3">
            <DetailRow icon="sport" label="Sport" value={selectedEvent.sport} />
            <DetailRow
              icon="date"
              label="Date"
              value={
                selectedEvent.end_date &&
                selectedEvent.end_date !== selectedEvent.event_date
                  ? `${formatDate(selectedEvent.event_date)} → ${formatDate(selectedEvent.end_date)}`
                  : formatDate(selectedEvent.event_date)
              }
            />
            <DetailRow
              icon="time"
              label="Time"
              value={`${formatTime(selectedEvent.start_time)} – ${formatTime(selectedEvent.end_time)}`}
            />
            <DetailRow icon="venue" label="Venue" value={selectedEvent.venue} />
            {selectedEvent.organizer && (
              <DetailRow
                icon="organizer"
                label="Organizer"
                value={selectedEvent.organizer}
              />
            )}
            {selectedEvent.description && (
              <div className="pt-1">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            )}
          </div>

          <div className="px-6 pb-5 flex flex-wrap gap-2 justify-end border-t border-gray-100 dark:border-white/5 pt-4">
            <button
              onClick={() => handleOpenPrintModal(selectedEvent)}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all"
            >
              Print
            </button>
            {user?.role !== "Athlete" && (
              <>
                <button
                  onClick={() => {
                    onEditEvent(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDeleteEvent(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold transition-all"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <PrintEventModal
        event={selectedEventForPrint}
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
      />
      {renderEventDetail()}

      <div className="-m-5 lg:-m-7">
        <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99] mt-7 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  Event Management
                </h1>
                <p className="text-blue-100 text-base font-medium">
                  Manage events, schedules, and competitions
                </p>
              </div>
              {user?.role !== "Athlete" && (
                <button
                  onClick={onAddEvent}
                  className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Event
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-white/5 overflow-hidden mb-8 flex flex-col transition-colors duration-300">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#1a1f2e] transition-colors duration-300">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                  <div className="flex-1 relative">
                    <svg
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by Name / Sport / Venue / Type"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                  >
                    <option value="All Status" className="dark:bg-[#1a1f2e]">
                      All Status
                    </option>
                    <option value="Upcoming" className="dark:bg-[#1a1f2e]">
                      Upcoming
                    </option>
                    <option value="Ongoing" className="dark:bg-[#1a1f2e]">
                      Ongoing
                    </option>
                    <option value="Completed" className="dark:bg-[#1a1f2e]">
                      Completed
                    </option>
                    <option value="Cancelled" className="dark:bg-[#1a1f2e]">
                      Cancelled
                    </option>
                  </select>
                  <select
                    value={sportFilter}
                    onChange={(e) => setSportFilter(e.target.value)}
                    className="px-3 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                  >
                    <option value="All Sports" className="dark:bg-[#1a1f2e]">
                      All Sports
                    </option>
                    {uniqueSports.map((sport) => (
                      <option
                        key={sport}
                        value={sport}
                        className="dark:bg-[#1a1f2e]"
                      >
                        {sport}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1 shrink-0">
                    {(["month", "week", "list"] as CalendarView[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setCalendarView(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                          ${
                            calendarView === v
                              ? "bg-[#396B99] text-white shadow"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {calendarView !== "list" && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={navigatePrev}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={navigateNext}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      <h2 className="text-sm font-bold text-gray-800 dark:text-white ml-1">
                        {getHeaderLabel()}
                      </h2>
                    </div>
                    <button
                      onClick={goToToday}
                      className="px-3 py-1.5 text-xs font-bold text-[#396B99] dark:text-blue-400 border-2 border-[#396B99] dark:border-blue-500/50 rounded-lg hover:bg-[#396B99] dark:hover:bg-blue-500/20 hover:text-white transition-all"
                    >
                      Today
                    </button>
                  </div>
                )}

                {user?.role !== "Athlete" && (
                  <button
                    onClick={onAddEvent}
                    className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#396B99] hover:bg-[#2d5577] text-white rounded-xl text-sm font-bold transition-all"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Event
                  </button>
                )}
              </div>
            </div>

            {loading && calendarView !== "list" ? (
              <div className="flex-1 flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-white/10"></div>
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-[#396B99] absolute top-0 left-0"></div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Loading events...
                  </p>
                </div>
              </div>
            ) : calendarView === "month" ? (
              renderMonthView()
            ) : calendarView === "week" ? (
              renderWeekView()
            ) : (
              renderListView()
            )}

            {!loading && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-[#1e2433] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-700 dark:text-white">
                      {filteredEvents.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-700 dark:text-white">
                      {events.length}
                    </span>{" "}
                    events
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Live Data
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Detail row helper ────────────────────────────────────────────────────────
const ICON_PATHS: Record<string, string> = {
  sport:
    "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
  date: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  time: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  venue:
    "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  organizer:
    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
      <svg
        className="w-4 h-4 text-[#396B99] dark:text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={ICON_PATHS[icon]}
        />
      </svg>
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">
        {value}
      </p>
    </div>
  </div>
);

export default EventList;
