"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "@/app/context/authContext";
import {
  FaHeadset,
  FaSpinner,
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaUserCheck,
  FaStar,
  FaFilter,
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
} from "react-icons/fa";
import { TbRefresh } from "react-icons/tb";

const MainLayout = dynamic(
  () => import("../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function SupportManagement() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const serverUri = process.env.NEXT_PUBLIC_SERVER_URI;

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${serverUri}/api/v1/support/stats`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching support stats:", error);
    }
  }, [auth.token, serverUri]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      });

      const { data } = await axios.get(
        `${serverUri}/api/v1/support/tickets?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setTickets(data.tickets || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  }, [auth.token, serverUri, page, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    if (auth.token) {
      fetchStats();
      fetchTickets();
    }
  }, [auth.token, fetchStats, fetchTickets]);

  const handleRefresh = () => {
    fetchStats();
    fetchTickets();
    toast.success("Data refreshed");
  };

  const handleAssign = async (id) => {
    try {
      setProcessingId(id);
      const { data } = await axios.put(
        `${serverUri}/api/v1/support/tickets/${id}/assign`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        toast.success("Ticket assigned to you");
        fetchTickets();
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
      toast.error("Failed to assign ticket");
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (id) => {
    const resolution = prompt("Enter resolution notes:");
    if (!resolution) return;

    try {
      setProcessingId(id);
      const { data } = await axios.put(
        `${serverUri}/api/v1/support/tickets/${id}/resolve`,
        { resolution },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        toast.success("Ticket resolved");
        fetchTickets();
        fetchStats();
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
      toast.error("Failed to resolve ticket");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setProcessingId(selectedTicket._id);
      const { data } = await axios.post(
        `${serverUri}/api/v1/support/tickets/${selectedTicket._id}/reply`,
        { message: replyText },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        toast.success("Reply sent");
        setReplyText("");
        setSelectedTicket(data.ticket);
        fetchTickets();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-blue-100 text-blue-800 border-blue-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || styles.open;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700 animate-pulse",
    };
    return styles[priority] || styles.low;
  };

  const categories = [
    { value: "order", label: "Order" },
    { value: "product", label: "Product" },
    { value: "payment", label: "Payment" },
    { value: "shipping", label: "Shipping" },
    { value: "return", label: "Return" },
    { value: "refund", label: "Refund" },
    { value: "account", label: "Account" },
    { value: "technical", label: "Technical" },
    { value: "other", label: "Other" },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaHeadset className="text-[#C6080A]" />
              Support Tickets
            </h1>
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Support Tickets" },
              ]}
            />
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TbRefresh className="text-gray-600" />
              Refresh
            </button>
            <button
              onClick={() => toast.info("Export feature coming soon")}
              className="flex items-center gap-2 px-4 py-2 bg-[#C6080A] text-white rounded-lg hover:bg-[#a50709] transition-colors"
            >
              <FaDownload />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaHeadset className="text-xl text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <h3 className="text-xl font-bold">{stats.total || 0}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaClock className="text-xl text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Open</p>
                <h3 className="text-xl font-bold">{stats.open || 0}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaSpinner className="text-xl text-yellow-600 animate-spin" />
              </div>
              <div>
                <p className="text-xs text-gray-500">In Progress</p>
                <h3 className="text-xl font-bold">{stats.inProgress || 0}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-xl text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Resolved</p>
                <h3 className="text-xl font-bold">{stats.resolved || 0}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="text-xl text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Urgent</p>
                <h3 className="text-xl font-bold">{stats.urgent || 0}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by subject, ticket #, or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <FaFilter className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-[#C6080A]" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tickets found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Ticket
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Assigned
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium line-clamp-1">{ticket.subject}</p>
                            <p className="text-xs text-gray-500">#{ticket.ticketNumber}</p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUser className="text-gray-500 text-xs" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {ticket.user?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {ticket.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="capitalize text-sm">{ticket.category}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {ticket.assignedTo ? (
                            <span className="text-sm">{ticket.assignedTo.name}</span>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-gray-600 hover:text-[#C6080A] transition-colors"
                              title="View & Reply"
                            >
                              <FaEye />
                            </button>
                            {!ticket.assignedTo && ticket.status === "open" && (
                              <button
                                onClick={() => handleAssign(ticket._id)}
                                disabled={processingId === ticket._id}
                                className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Assign to me"
                              >
                                {processingId === ticket._id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaUserCheck />
                                )}
                              </button>
                            )}
                            {ticket.status !== "resolved" && ticket.status !== "closed" && (
                              <button
                                onClick={() => handleResolve(ticket._id)}
                                disabled={processingId === ticket._id}
                                className="p-2 text-green-600 hover:text-green-800 transition-colors"
                                title="Resolve"
                              >
                                {processingId === ticket._id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaCheck />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedTicket(null);
                    setReplyText("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">Ticket: #{selectedTicket.ticketNumber}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                      selectedTicket.priority
                    )}`}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                {selectedTicket.replies?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-700">Replies</h3>
                    {selectedTicket.replies.map((reply, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          reply.senderType === "admin"
                            ? "bg-blue-50 border border-blue-100"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {reply.sender?.name || "Unknown"}
                          </span>
                          {reply.senderType === "admin" && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Support
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {format(new Date(reply.createdAt), "MMM d, HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleReply}
                        disabled={!replyText.trim() || processingId === selectedTicket._id}
                        className="flex-1 bg-[#C6080A] text-white py-2 rounded-lg hover:bg-[#a50709] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === selectedTicket._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaCheck /> Send Reply
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleResolve(selectedTicket._id)}
                        disabled={processingId === selectedTicket._id}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle /> Resolve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
