"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "@/app/context/authContext";
import {
  FaCalendarAlt,
  FaSpinner,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaGift,
  FaUsers,
  FaStar,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";
import { TbRefresh } from "react-icons/tb";
import { useRouter } from "next/navigation";

const MainLayout = dynamic(
  () => import("../../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function EventsManagement() {
  const { auth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "custom",
    points: 100,
    multiplier: 1,
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [processing, setProcessing] = useState(false);

  const serverUri = process.env.NEXT_PUBLIC_SERVER_URI;

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${serverUri}/api/v1/rewards/admin/events`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [auth.token, serverUri]);

  useEffect(() => {
    if (auth.token) {
      fetchEvents();
    }
  }, [auth.token, fetchEvents]);

  const handleRefresh = () => {
    fetchEvents();
    toast.success("Events refreshed");
  };

  const handleCreate = async () => {
    try {
      setProcessing(true);
      const { data } = await axios.post(
        `${serverUri}/api/v1/rewards/admin/events`,
        formData,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        toast.success("Event created successfully");
        fetchEvents();
        closeModal();
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;

    try {
      setProcessing(true);
      const { data } = await axios.put(
        `${serverUri}/api/v1/rewards/admin/events/${editingEvent._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        toast.success("Event updated successfully");
        fetchEvents();
        closeModal();
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error.response?.data?.message || "Failed to update event");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { data } = await axios.delete(
        `${serverUri}/api/v1/rewards/admin/events/${id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        toast.success("Event deleted");
        fetchEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      name: "",
      description: "",
      type: "custom",
      points: 100,
      multiplier: 1,
      startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || "",
      type: event.type,
      points: event.points,
      multiplier: event.multiplier,
      startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
      isActive: event.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setProcessing(false);
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? event.isActive
        : !event.isActive;
    return matchesSearch && matchesStatus;
  });

  const getEventTypeColor = (type) => {
    const colors = {
      purchase_bonus: "bg-blue-100 text-blue-800",
      first_purchase: "bg-green-100 text-green-800",
      birthday: "bg-pink-100 text-pink-800",
      anniversary: "bg-purple-100 text-purple-800",
      referral: "bg-yellow-100 text-yellow-800",
      review: "bg-orange-100 text-orange-800",
      social_share: "bg-cyan-100 text-cyan-800",
      custom: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.custom;
  };

  const isEventActive = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return event.isActive && now >= start && now <= end;
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <button
              onClick={() => router.push("/dashboard/rewards")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#C6080A] mb-2"
            >
              <FaArrowLeft />
              Back to Rewards
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaCalendarAlt className="text-[#C6080A]" />
              Reward Events
            </h1>
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Rewards", href: "/dashboard/rewards" },
                { label: "Events" },
              ]}
            />
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <TbRefresh className="text-gray-600" />
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#C6080A] text-white rounded-lg hover:bg-[#a50709]"
            >
              <FaPlus />
              Create Event
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Events List */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-[#C6080A]" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No events found</p>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-[#C6080A] text-white rounded-lg hover:bg-[#a50709]"
                >
                  Create First Event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    className={`p-4 border rounded-xl transition-all ${
                      isEventActive(event)
                        ? "border-green-300 bg-green-50/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{event.name}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(
                              event.type
                            )}`}
                          >
                            {event.type.replace("_", " ")}
                          </span>
                          {isEventActive(event) && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaGift className="text-[#C6080A]" />
                            {event.points} points
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStar className="text-yellow-500" />
                            {event.multiplier}x multiplier
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock />
                            {format(new Date(event.startDate), "MMM d")} -{" "}
                            {format(new Date(event.endDate), "MMM d, yyyy")}
                          </span>
                          {event.statistics && (
                            <span className="flex items-center gap-1">
                              <FaUsers className="text-blue-500" />
                              {event.statistics.totalRedemptions || 0} redemptions
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-2 text-gray-600 hover:text-[#C6080A] hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {editingEvent ? "Edit Event" : "Create Event"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                      placeholder="e.g., Summer Sale Bonus"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                      placeholder="Event description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                      >
                        <option value="purchase_bonus">Purchase Bonus</option>
                        <option value="first_purchase">First Purchase</option>
                        <option value="birthday">Birthday</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="referral">Referral</option>
                        <option value="review">Review</option>
                        <option value="social_share">Social Share</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points *
                      </label>
                      <input
                        type="number"
                        value={formData.points}
                        onChange={(e) =>
                          setFormData({ ...formData, points: parseInt(e.target.value) })
                        }
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Multiplier
                    </label>
                    <input
                      type="number"
                      value={formData.multiplier}
                      onChange={(e) =>
                        setFormData({ ...formData, multiplier: parseFloat(e.target.value) })
                      }
                      min={1}
                      max={10}
                      step={0.1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Points will be multiplied by this value
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({ ...formData, startDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-[#C6080A] focus:ring-[#C6080A] border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingEvent ? handleUpdate : handleCreate}
                    disabled={processing || !formData.name || !formData.startDate || !formData.endDate}
                    className="flex-1 px-4 py-2 bg-[#C6080A] text-white rounded-lg hover:bg-[#a50709] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        {editingEvent ? "Update" : "Create"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
