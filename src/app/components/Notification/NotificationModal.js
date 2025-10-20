"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { X, Mail, FileText, Users, Send } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import JoditEditor from "jodit-react";
import Select from "react-select";
import { FaSpinner } from "react-icons/fa";

const Style = dynamic(() => import("./../../utils/CommonStyle"), {
  ssr: false,
});

export default function NotificationModal({
  closeModal,
  setAddNotification,
  notificationId,
  setNotificationId,
}) {
  const [usersData, setUsersData] = useState([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [emails, setEmails] = useState([]);
  const editor = useRef(null);
  const [usersOptions, setUsersOptions] = useState([]);
  const [isloading, setIsloading] = useState(false);

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {
    if (usersData && Array?.isArray(usersData)) {
      const formattedOptions = usersData?.map((user) => ({
        value: user.email || "",
        label: user.name || "",
      }));
      setUsersOptions(formattedOptions);
    }
  }, [usersData]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/allUsers`
      );
      if (data) {
        setUsersData(data.users);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleSelectAll = (isChecked) => {
    setSelectAllChecked(isChecked);
    if (isChecked) {
      setEmails(usersOptions);
    } else {
      setEmails([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !content) {
      return toast.error("Please fill all the fields");
    }
    if (emails.length === 0) {
      return toast.error("Please select at least one user");
    }
    setIsloading(true);
    const data = {
      subject,
      context: content,
      emails: emails.map((email) => email.value),
    };
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/send`,
        data
      );
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        setSubject("");
        setContent("");
        setEmails([]);
        setSelectAllChecked(false);
        setIsloading(false);
        setNotificationId("");
        setAddNotification(false);
      } else {
        toast.error(res?.data?.message);
        setIsloading(false);
      }
    } catch (error) {
      console.log("Error sending notification:", error);
      toast.error("Error sending notification. Please try again!");
      setIsloading(false);
    }
  };

  const config = {
    readonly: false,
    contentCss: "body { color: #111; }",
    height: 350,
    width: "100%",
    color: "#111",
    placeholder: "Write your notification content here...",
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-xl max-h-[95vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">
            {notificationId ? "Edit Notification" : "Send Notification"}
          </h3>
        </div>
        <button
          onClick={() => {
            setNotificationId("");
            setAddNotification(false);
          }}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors duration-200"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-6">
          {/* Subject Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 text-red-600" />
              Subject
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter notification subject"
              required
            />
          </div>

          {/* Recipients Field */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Users className="w-4 h-4 text-red-600" />
                Recipients
                <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <input
                  type="checkbox"
                  checked={selectAllChecked}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span className="font-medium">Select All</span>
              </label>
            </div>
            <Select
              options={usersOptions}
              value={emails}
              onChange={(selected) => {
                setEmails(selected);
                setSelectAllChecked(
                  selected.length === usersOptions.length &&
                    usersOptions.length > 0
                );
              }}
              isMulti
              placeholder="Choose recipients..."
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "0.25rem",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: "#3b82f6",
                  },
                  "&:focus-within": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                  },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? "#3b82f6"
                    : state.isFocused
                    ? "#eff6ff"
                    : "white",
                  color: state.isSelected ? "white" : "#111",
                  cursor: "pointer",
                  "&:active": {
                    backgroundColor: "#3b82f6",
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#dbeafe",
                  borderRadius: "0.375rem",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#1e40af",
                  fontWeight: "500",
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: "#1e40af",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#bfdbfe",
                    color: "#1e3a8a",
                  },
                }),
              }}
              required
            />
            {emails.length > 0 && (
              <p className="text-xs text-gray-500">
                {emails.length} recipient{emails.length !== 1 ? "s" : ""}{" "}
                selected
              </p>
            )}
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 text-red-600" />
              Message Content
              <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500">
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => setContent(newContent)}
                required
              />
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => {
            setNotificationId("");
            setAddNotification(false);
          }}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isloading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-2"
        >
          {isloading ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{notificationId ? "Save" : "Send"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
