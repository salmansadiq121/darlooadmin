"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "@/app/context/authContext";
import {
  FaHeadset,
  FaSpinner,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaUserCheck,
  FaPaperclip,
  FaDownload,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaTag,
  FaExclamationTriangle,
} from "react-icons/fa";
import { TbRefresh } from "react-icons/tb";

const MainLayout = dynamic(
  () => import("../../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function TicketDetailPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);
  const messagesEndRef = useRef(null);

  const serverUri = process.env.NEXT_PUBLIC_SERVER_URI;

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${serverUri}/api/v1/support/tickets/${id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setTicket(data.ticket);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token && id) {
      fetchTicket();
    }
  }, [auth.token, id]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.replies]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      setSendingReply(true);
      const { data } = await axios.post(
        `${serverUri}/api/v1/support/tickets/${id}/reply`,
        { message: replyText },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setTicket(data.ticket);
        setReplyText("");
        toast.success("Reply sent successfully");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleAssign = async () => {
    try {
      setProcessingAction("assign");
      const { data } = await axios.put(
        `${serverUri}/api/v1/support/tickets/${id}/assign`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setTicket(data.ticket);
        toast.success("Ticket assigned to you");
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
      toast.error("Failed to assign ticket");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleResolve = async () => {
    const resolution = prompt("Enter resolution notes:");
    if (!resolution) return;

    try {
      setProcessingAction("resolve");
      const { data } = await axios.put(
        `${serverUri}/api/v1/support/tickets/${id}/resolve`,
        { resolution },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setTicket(data.ticket);
        toast.success("Ticket resolved successfully");
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
      toast.error("Failed to resolve ticket");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleClose = async () => {
    if (!confirm("Are you sure you want to close this ticket?")) return;

    try {
      setProcessingAction("close");
      const { data } = await axios.put(
        `${serverUri}/api/v1/support/tickets/${id}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setTicket(data.ticket);
        toast.success("Ticket closed");
      }
    } catch (error) {
      console.error("Error closing ticket:", error);
      toast.error("Failed to close ticket");
    } finally {
      setProcessingAction(null);
    }
  };

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
      urgent: "bg-red-100 text-red-700",
    };
    return styles[priority] || styles.low;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <FaSpinner className="animate-spin text-4xl text-[#C6080A]" />
        </div>
      </MainLayout>
    );
  }

  if (!ticket) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Ticket not found</p>
            <button
              onClick={() => router.push("/dashboard/support")}
              className="mt-4 text-[#C6080A] hover:underline"
            >
              Back to Support
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const canReply = ticket.status !== "closed" && ticket.status !== "cancelled";
  const isAssigned = ticket.assignedTo?._id === auth.user?._id;

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <button
              onClick={() => router.push("/dashboard/support")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#C6080A] mb-2"
            >
              <FaArrowLeft />
              Back to Tickets
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaHeadset className="text-[#C6080A]" />
              {ticket.subject}
            </h1>
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Support", href: "/dashboard/support" },
                { label: ticket.ticketNumber },
              ]}
            />
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={fetchTicket}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <TbRefresh className="text-gray-600" />
              Refresh
            </button>
            {!ticket.assignedTo && ticket.status === "open" && (
              <button
                onClick={handleAssign}
                disabled={processingAction === "assign"}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {processingAction === "assign" ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaUserCheck />
                )}
                Assign to Me
              </button>
            )}
            {ticket.status !== "resolved" && ticket.status !== "closed" && (
              <button
                onClick={handleResolve}
                disabled={processingAction === "resolve"}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processingAction === "resolve" ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaCheckCircle />
                )}
                Resolve
              </button>
            )}
            {ticket.status !== "closed" && (
              <button
                onClick={handleClose}
                disabled={processingAction === "close"}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {processingAction === "close" ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTimes />
                )}
                Close
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(ticket.priority)}`}>
                  {ticket.priority} priority
                </span>
                <span className="text-sm text-gray-500">
                  #{ticket.ticketNumber}
                </span>
              </div>

              {ticket.resolution && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                    <FaCheckCircle />
                    Resolution
                  </div>
                  <p className="text-sm text-green-700">{ticket.resolution}</p>
                  {ticket.resolvedBy && (
                    <p className="text-xs text-green-600 mt-1">
                      Resolved by {ticket.resolvedBy.name} on{" "}
                      {format(new Date(ticket.resolvedAt), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              )}

              {/* Original Message */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#C6080A] flex items-center justify-center text-white font-medium">
                    {ticket.user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{ticket.user?.name || "Unknown"}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(ticket.createdAt), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Attachments */}
                    {ticket.attachments?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {ticket.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                          >
                            <FaPaperclip className="text-gray-400" />
                            {att.name}
                            <FaDownload className="text-gray-400 text-xs" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {ticket.replies?.map((reply, index) => (
                  <div key={index} className="flex gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${
                        reply.senderType === "admin" ? "bg-blue-600" : "bg-[#C6080A]"
                      }`}
                    >
                      {reply.senderType === "admin" ? "S" : reply.sender?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {reply.sender?.name || (reply.senderType === "admin" ? "Support" : "User")}
                        </span>
                        {reply.senderType === "admin" && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            Support Agent
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {format(new Date(reply.createdAt || ticket.createdAt), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg p-4 ${
                          reply.senderType === "admin"
                            ? "bg-blue-50 border border-blue-100"
                            : "bg-gray-50"
                        }`}
                      >
                        <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              {canReply && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      S
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                        rows={4}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {replyText.length}/1000 characters
                        </span>
                        <button
                          onClick={handleSendReply}
                          disabled={!replyText.trim() || sendingReply}
                          className="flex items-center gap-2 px-6 py-2 bg-[#C6080A] text-white rounded-lg hover:bg-[#a50709] disabled:opacity-50"
                        >
                          {sendingReply ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <>
                              <FaCheck />
                              Send Reply
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-gray-400" />
                Customer Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#C6080A] flex items-center justify-center text-white text-lg font-medium">
                    {ticket.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-medium">{ticket.user?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FaEnvelope className="text-gray-400" />
                    <span>{ticket.user?.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaPhone className="text-gray-400" />
                    <span>{ticket.user?.number || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaTag className="text-gray-400" />
                Ticket Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="capitalize">{ticket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority</span>
                  <span className="capitalize">{ticket.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="capitalize">{ticket.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                </div>
                {ticket.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned To</span>
                    <span>{ticket.assignedTo.name}</span>
                  </div>
                )}
                {ticket.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Resolved</span>
                    <span>{format(new Date(ticket.resolvedAt), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            {ticket.rating?.score && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  Customer Rating
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-5 w-5 ${
                        i < ticket.rating.score
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                {ticket.rating.feedback && (
                  <p className="text-sm text-gray-600 mt-2">{ticket.rating.feedback}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Rated on {format(new Date(ticket.rating.ratedAt), "MMM d, yyyy")}
                </p>
              </div>
            )}

            {/* Related Info */}
            {ticket.order && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Related Order</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order #</span>
                    <span className="font-medium">{ticket.order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span>€{ticket.order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
