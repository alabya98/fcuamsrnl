import { useState, useEffect } from "react";
import EventService from "../../../services/EventService";
import type { EventColumns } from "../../../interfaces/EventInterface";

const AthleteEventsView = () => {
  const [events, setEvents] = useState<EventColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing">(
    "upcoming",
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const eventsResponse = await EventService.loadEvents();
      if (eventsResponse.status === 200) setEvents(eventsResponse.data.events);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (time: string) => (!time ? "" : time.substring(0, 5));

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return event.status === "Upcoming";
    if (filter === "ongoing") return event.status === "Ongoing";
    return true;
  });

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300";
      case "Ongoing":
        return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";
      case "Completed":
        return "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300";
      default:
        return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-sm dark:shadow-black/30 p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
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
            Events
          </h2>

          <div className="flex gap-2">
            {(["all", "upcoming", "ongoing"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
              No events found
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-1">
              Check back later for new events
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.event_id}
                className="bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-[#1e2433] border-2 border-gray-200 dark:border-white/5 rounded-xl p-5 hover:shadow-lg dark:hover:shadow-black/20 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Badges */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="px-4 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 text-sm font-bold rounded-full shadow-sm">
                        {event.sport}
                      </span>
                      <span
                        className={`px-4 py-1.5 text-sm font-bold rounded-full shadow-sm ${getEventStatusColor(event.status)}`}
                      >
                        {event.status}
                      </span>
                      <span className="px-4 py-1.5 bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-sm font-bold rounded-full shadow-sm">
                        {event.event_type}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 dark:text-white text-xl mb-2">
                      {event.event_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {event.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg
                          className="w-4 h-4 text-blue-500 dark:text-blue-400"
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
                        <span className="font-medium">{event.venue}</span>
                      </div>

                      {event.organizer && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-4 h-4 text-green-500 dark:text-green-400"
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
                          <span className="font-medium">
                            Organizer: {event.organizer}
                          </span>
                        </div>
                      )}

                      {event.max_participants && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-4 h-4 text-purple-500 dark:text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="font-medium">
                            Max: {event.max_participants} participants
                          </span>
                        </div>
                      )}

                      {event.registration_deadline && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-4 h-4 text-red-500 dark:text-red-400"
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
                          <span className="font-medium">
                            Register by:{" "}
                            {formatDate(event.registration_deadline)}
                          </span>
                        </div>
                      )}
                    </div>

                    {event.notes && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <span className="font-semibold">Note:</span>{" "}
                          {event.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Date Badge */}
                  <div className="text-right ml-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-500/30 rounded-xl flex flex-col items-center justify-center shadow-md">
                      <span className="text-xs text-orange-600 dark:text-orange-300 font-medium">
                        {new Date(event.event_date).toLocaleDateString(
                          "en-US",
                          { month: "short" },
                        )}
                      </span>
                      <span className="text-2xl font-bold text-orange-700 dark:text-orange-200">
                        {new Date(event.event_date).getDate()}
                      </span>
                      <span className="text-xs text-orange-600 dark:text-orange-300 font-medium">
                        {new Date(event.event_date).getFullYear()}
                      </span>
                    </div>

                    {event.end_date && event.end_date !== event.event_date && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                        <span className="block">to</span>
                        <div className="mt-1 px-2 py-1 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-500/20">
                          <span className="font-bold text-orange-700 dark:text-orange-300">
                            {new Date(event.end_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium">
                      {formatTime(event.start_time)} -{" "}
                      {formatTime(event.end_time)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AthleteEventsView;
