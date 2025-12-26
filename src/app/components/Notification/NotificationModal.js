"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  Mail,
  FileText,
  Users,
  Send,
  Sparkles,
  CheckCircle2,
  LayoutTemplate,
  Eye,
  Globe,
  Search,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import JoditEditor from "jodit-react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/authContext";

const Style = dynamic(() => import("./../../utils/CommonStyle"), {
  ssr: false,
});

// Debounce hook for search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom option component for users
const CustomUserOption = ({ data, innerRef, innerProps, isSelected }) => (
  <div
    ref={innerRef}
    {...innerProps}
    className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
      isSelected ? "bg-red-50" : "hover:bg-gray-50"
    }`}
  >
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-red-100 to-orange-100 flex-shrink-0">
      {data.avatar ? (
        <Image
          src={data.avatar}
          alt={data.label}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-red-500 font-bold text-sm">
          {data.label?.charAt(0)?.toUpperCase() || "U"}
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{data.label}</p>
      <p className="text-xs text-gray-500 truncate">{data.email}</p>
    </div>
    {isSelected && (
      <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0" />
    )}
  </div>
);

// Custom multi-value component
const CustomMultiValue = ({ data, removeProps }) => (
  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1 m-0.5">
    <div className="w-5 h-5 rounded-full overflow-hidden bg-red-100 flex-shrink-0">
      {data.avatar ? (
        <Image
          src={data.avatar}
          alt={data.label}
          width={20}
          height={20}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-red-500 font-bold text-[10px]">
          {data.label?.charAt(0)?.toUpperCase() || "U"}
        </div>
      )}
    </div>
    <span className="text-xs font-medium text-red-700 max-w-[100px] truncate">
      {data.label}
    </span>
    <button
      {...removeProps}
      className="text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

export default function NotificationModal({
  closeModal,
  setAddNotification,
  notificationId,
  setNotificationId,
}) {
  const { auth } = useAuth();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [emails, setEmails] = useState([]);
  const editor = useRef(null);
  const [isloading, setIsloading] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [allUsersCache, setAllUsersCache] = useState([]);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
    // Fetch initial users count
    fetchInitialUsers();
    // eslint-disable-next-line
  }, []);

  const fetchInitialUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/users/search?limit=50`,
        { headers: { Authorization: auth?.token } }
      );
      if (data?.success) {
        setTotalUsers(data.pagination?.total || 0);
        const formatted = data.users.map((user) => ({
          value: user.email,
          label: user.name || user.email,
          email: user.email,
          avatar: user.avatar?.url || user.avatar,
          id: user._id,
        }));
        setAllUsersCache(formatted);
      }
    } catch (error) {
      console.log("Error fetching initial users:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/templates`,
        { headers: { Authorization: auth?.token } }
      );
      if (data?.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.log("Error fetching templates:", error);
    }
  };

  // Dynamic user search function
  const searchUsers = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      return allUsersCache;
    }

    setIsLoadingUsers(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/users/search?search=${encodeURIComponent(inputValue)}&limit=30`,
        { headers: { Authorization: auth?.token } }
      );

      if (data?.success) {
        const formatted = data.users.map((user) => ({
          value: user.email,
          label: user.name || user.email,
          email: user.email,
          avatar: user.avatar?.url || user.avatar,
          id: user._id,
        }));
        return formatted;
      }
      return [];
    } catch (error) {
      console.log("Error searching users:", error);
      return [];
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load options for AsyncSelect
  const loadOptions = useCallback(
    (inputValue, callback) => {
      searchUsers(inputValue).then((options) => {
        callback(options);
      });
    },
    [auth?.token, allUsersCache]
  );

  const handleTemplateSelect = (template) => {
    if (template) {
      setSelectedTemplate(template);
      setSubject(template.subject);
      setContent(template.context);
      // Initialize template variables
      const vars = {};
      template.variables?.forEach((v) => {
        vars[v.name] = v.example || "";
      });
      setTemplateVariables(vars);
    } else {
      setSelectedTemplate(null);
      setSubject("");
      setContent("");
      setTemplateVariables({});
    }
  };

  const handleSelectAll = async (isChecked) => {
    setSelectAllChecked(isChecked);
    if (isChecked) {
      setIsLoadingUsers(true);
      try {
        // Fetch all customers
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/customers/all`,
          { headers: { Authorization: auth?.token } }
        );
        if (data?.success) {
          const formatted = data.customers.map((user) => ({
            value: user.email,
            label: user.name || user.email,
            email: user.email,
            id: user._id,
          }));
          setEmails(formatted);
          setTotalUsers(data.total || formatted.length);
        }
      } catch (error) {
        console.log("Error fetching all customers:", error);
        toast.error("Failed to fetch all customers");
      } finally {
        setIsLoadingUsers(false);
      }
    } else {
      setEmails([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !content) {
      return toast.error("Please fill all the fields");
    }
    if (!sendToAll && emails.length === 0) {
      return toast.error(
        "Please select at least one user or enable 'Send to All'"
      );
    }
    setIsloading(true);
    const notificationData = {
      subject,
      context: content,
      emails: sendToAll ? [] : emails.map((email) => email.value),
      sendToAll,
      templateId: selectedTemplate?._id || null,
      templateVariables,
    };
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/send`,
        notificationData,
        { headers: { Authorization: auth?.token } }
      );
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        setSubject("");
        setContent("");
        setEmails([]);
        setSelectAllChecked(false);
        setSendToAll(false);
        setSelectedTemplate(null);
        setTemplateVariables({});
        setIsloading(false);
        setNotificationId("");
        setAddNotification(false);
      } else {
        toast.error(res?.data?.message);
        setIsloading(false);
      }
    } catch (error) {
      console.log("Error sending notification:", error);
      toast.error(error?.response?.data?.message || "Error sending notification. Please try again!");
      setIsloading(false);
    }
  };

  const config = {
    readonly: false,
    contentCss: "body { color: #111; font-family: 'Inter', sans-serif; }",
    height: 350,
    width: "100%",
    color: "#111",
    placeholder: "Write your notification content here...",
    toolbar: true,
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "link",
      "|",
      "undo",
      "redo",
    ],
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#dc2626" : "#e5e7eb",
      borderRadius: "0.75rem",
      padding: "0.25rem",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(220, 38, 38, 0.1)" : "none",
      borderWidth: "2px",
      minHeight: "48px",
      "&:hover": {
        borderColor: "#dc2626",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      border: "1px solid #e5e7eb",
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: "0.5rem",
      maxHeight: "280px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#dc2626"
        : state.isFocused
        ? "#fef2f2"
        : "white",
      color: state.isSelected ? "white" : "#111",
      cursor: "pointer",
      borderRadius: "0.5rem",
      marginBottom: "2px",
      "&:active": {
        backgroundColor: "#dc2626",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "transparent",
      margin: "0",
    }),
    multiValueLabel: (base) => ({
      ...base,
      padding: "0",
    }),
    multiValueRemove: (base) => ({
      ...base,
      display: "none",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
    }),
    loadingIndicator: (base) => ({
      ...base,
      color: "#dc2626",
    }),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          setNotificationId("");
          setAddNotification(false);
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modern Header with Gradient */}
          <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-rose-600 px-8 py-6 overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {notificationId ? "Edit Notification" : "Send Notification"}
                  </h3>
                  <p className="text-sm text-white/90 mt-1">
                    Create and send notifications to users
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setNotificationId("");
                  setAddNotification(false);
                }}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 px-8 py-6"
            >
              {/* Template Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <LayoutTemplate className="w-4 h-4 text-red-600" />
                  Choose Template (Optional)
                </label>
                <Select
                  options={[
                    { value: null, label: "Custom Notification" },
                    ...templates.map((t) => ({
                      value: t._id,
                      label: `${t.name} (${t.category})`,
                      template: t,
                    })),
                  ]}
                  value={
                    selectedTemplate
                      ? {
                          value: selectedTemplate._id,
                          label: `${selectedTemplate.name} (${selectedTemplate.category})`,
                        }
                      : { value: null, label: "Custom Notification" }
                  }
                  onChange={(option) => {
                    if (option?.template) {
                      handleTemplateSelect(option.template);
                    } else {
                      handleTemplateSelect(null);
                    }
                  }}
                  placeholder="Select a template..."
                  className="text-sm"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#dc2626" : "#e5e7eb",
                      borderRadius: "0.75rem",
                      padding: "0.25rem",
                      boxShadow: state.isFocused
                        ? "0 0 0 3px rgba(220, 38, 38, 0.1)"
                        : "none",
                      borderWidth: "2px",
                      "&:hover": {
                        borderColor: "#dc2626",
                      },
                    }),
                  }}
                />
                {selectedTemplate && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Template:</strong> {selectedTemplate.name} |{" "}
                      <strong>Category:</strong> {selectedTemplate.category}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Template Variables */}
              {selectedTemplate &&
                selectedTemplate.variables &&
                selectedTemplate.variables.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Template Variables
                    </label>
                    {selectedTemplate.variables.map((variable, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">
                          {variable.name}
                          {variable.description && (
                            <span className="text-gray-400 ml-1">
                              ({variable.description})
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={templateVariables[variable.name] || ""}
                          onChange={(e) =>
                            setTemplateVariables({
                              ...templateVariables,
                              [variable.name]: e.target.value,
                            })
                          }
                          placeholder={
                            variable.example || `Enter ${variable.name}`
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    ))}
                  </motion.div>
                )}

              {/* Subject Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4 text-red-600" />
                  Subject
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter notification subject"
                  required
                />
              </motion.div>

              {/* Send to All Option */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
              >
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => {
                    setSendToAll(e.target.checked);
                    if (e.target.checked) {
                      setEmails([]);
                      setSelectAllChecked(false);
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <div>
                    <label className="text-sm font-semibold text-gray-900 cursor-pointer">
                      Send to All Customers
                    </label>
                    <p className="text-xs text-gray-600">
                      This will send the notification to all {totalUsers} active customers
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Recipients Field with Dynamic Search */}
              {!sendToAll && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Users className="w-4 h-4 text-red-600" />
                      Recipients
                      <span className="text-red-500">*</span>
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 px-3 py-1.5 rounded-lg"
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectAllChecked}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          disabled={isLoadingUsers}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer disabled:opacity-50"
                        />
                        <span className="font-medium">
                          {isLoadingUsers ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            `Select All (${totalUsers})`
                          )}
                        </span>
                      </label>
                    </motion.div>
                  </div>

                  {/* Dynamic Search Users */}
                  <div className="relative">
                    <AsyncSelect
                      cacheOptions
                      defaultOptions={allUsersCache}
                      loadOptions={loadOptions}
                      value={emails}
                      onChange={(selected) => {
                        setEmails(selected || []);
                        setSelectAllChecked(false);
                      }}
                      isMulti
                      placeholder={
                        <span className="flex items-center gap-2 text-gray-400">
                          <Search className="w-4 h-4" />
                          Search users by name, email, or phone...
                        </span>
                      }
                      noOptionsMessage={({ inputValue }) =>
                        inputValue.length < 2
                          ? "Type at least 2 characters to search..."
                          : "No users found"
                      }
                      loadingMessage={() => (
                        <span className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching users...
                        </span>
                      )}
                      components={{
                        Option: CustomUserOption,
                        MultiValue: CustomMultiValue,
                      }}
                      styles={customSelectStyles}
                      className="text-sm"
                      isClearable={false}
                      closeMenuOnSelect={false}
                    />
                  </div>

                  {emails.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          <strong>{emails.length}</strong> recipient
                          {emails.length !== 1 ? "s" : ""} selected
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEmails([]);
                          setSelectAllChecked(false);
                        }}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        Clear All
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Content Editor */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  Message Content
                  <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all duration-200">
                  <JoditEditor
                    ref={editor}
                    value={content}
                    config={config}
                    tabIndex={1}
                    onBlur={(newContent) => setContent(newContent)}
                    required
                  />
                </div>
              </motion.div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
            <div className="text-xs text-gray-500">
              {sendToAll ? (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Sending to all {totalUsers} customers
                </span>
              ) : emails.length > 0 ? (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Sending to {emails.length} selected user{emails.length !== 1 ? "s" : ""}
                </span>
              ) : (
                <span>Select recipients to send notification</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setNotificationId("");
                  setAddNotification(false);
                }}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isloading || (!sendToAll && emails.length === 0)}
                className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl hover:from-red-700 hover:to-rose-700 disabled:from-red-400 disabled:to-rose-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-2 shadow-lg shadow-red-200"
              >
                {isloading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      {notificationId ? "Save Changes" : "Send Notification"}
                    </span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
