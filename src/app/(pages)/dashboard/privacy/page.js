"use client";
import MainLayout from "./../../../components/layout/MainLayout";
import PrivacyModal from "../../../components/PrivacyPolicy/PolicyModal";
import Breadcrumb from "./../../../utils/Breadcrumb";
import React, { useEffect, useState } from "react";

export default function Privacy() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [addPrivacy, setAddPrivacy] = useState(false);
  const [privacyId, setPrivacyId] = useState("");

  // Page URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
    // exlint-disable-next-line
  }, []);

  return (
    <MainLayout>
      <div className="relative p-1 sm:p-2 px-1 sm:px-6 h-[100%] w-full pb-4 scroll-smooth">
        <div className="flex flex-col pb-2 h-full">
          <Breadcrumb path={currentUrl} />
          <div className="flex flex-col gap-4 mt-4  w-full h-full">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-sans font-semibold text-black">
                Terms & Policy
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setPrivacyId("1");
                    setAddPrivacy(true);
                  }}
                  className="flex text-[15px] w-[8rem] items-center justify-center text-white bg-slate-400 hover:bg-slate-500  py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03]"
                >
                  EDIT
                </button>
                <button
                  className={`flex text-[15px] w-[8rem] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800   py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03]`}
                >
                  DELETE
                </button>
              </div>
            </div>
            {/*  */}
            <div className="relative overflow-hidden w-full h-[85%] py-3 sm:py-4 bg-white rounded-md shadow px-3 sm:px-4 mt-4 overflow-y-auto shidden">
              <p className="mb-4 text-[14px] text-gray-700">
                Welcome to Ayoob.com! We are committed to protecting your
                privacy and ensuring your personal information is handled safely
                and responsibly. This Privacy Policy explains how we collect,
                use, disclose, and protect your information when you use our
                website.
              </p>

              <h2 className="text-lg font-semibold mt-6 mb-3">
                1. Information We Collect
              </h2>
              <p className="mb-4 text-[14px] text-gray-700">
                When you visit or make a purchase on our website, we may collect
                the following types of information:
              </p>
              <ul className="list-disc ml-6 mb-4 text-[14px] text-gray-700">
                <li>
                  Personal Information: Name, email address, phone number,
                  billing address, and shipping address.
                </li>
                <li>
                  Payment Information: Credit/debit card details or other
                  payment methods, processed securely via third-party services.
                </li>
                <li>
                  Account Information: Username, password, and order history.
                </li>
                <li>
                  Technical Data: IP address, browser type, device information,
                  and cookies to enhance your shopping experience.
                </li>
              </ul>

              <h2 className="text-lg font-semibold mt-6 mb-3">
                2. How We Use Your Information
              </h2>
              <p className="mb-4 text-[14px] text-gray-700">
                The information we collect is used for the following purposes:
              </p>
              <ul className="list-disc ml-6 mb-4 text-[14px] text-gray-700">
                <li>Processing and fulfilling your orders.</li>
                <li>Providing customer support and responding to inquiries.</li>
                <li>Improving our website, products, and services.</li>
                <li>
                  Sending promotional emails, offers, and updates (if you opt
                  in).
                </li>
                <li>
                  Complying with legal obligations and preventing fraudulent
                  activity.
                </li>
              </ul>

              <h2 className="text-lg font-semibold mt-6 mb-3">
                3. Sharing Your Information
              </h2>
              <p className="mb-4 text-[14px] text-gray-700">
                We do not sell your personal information. However, we may share
                your information with trusted third parties to facilitate
                services such as:
              </p>
              <ul className="list-disc ml-6 mb-4 text-[14px] text-gray-700">
                <li>Payment processing providers.</li>
                <li>Shipping and delivery partners.</li>
                <li>
                  Marketing and analytics tools to enhance user experience.
                </li>
                <li>Legal authorities if required by law.</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6 mb-3">
                4. Protecting Your Information
              </h2>
              <p className="mb-4 text-[14px] text-gray-700">
                We implement security measures to safeguard your personal data
                from unauthorized access, alteration, or disclosure. Payment
                information is encrypted and handled securely by third-party
                services.
              </p>

              <h2 className="text-lg font-semibold mt-6 mb-3">
                5. Your Choices and Rights
              </h2>
              <p className="mb-4 text-[14px] text-gray-700">
                You have the right to:
              </p>
              <ul className="list-disc ml-6 mb-4 text-[14px] text-gray-700">
                <li>
                  Access, update, or delete your personal information by logging
                  into your account.
                </li>
                <li>
                  Opt out of receiving promotional emails by clicking the
                  &quot;unsubscribe&quot; link in our emails.
                </li>
                <li>
                  Disable cookies in your browser settings, though this may
                  affect website functionality.
                </li>
              </ul>

              <h2 className="text-lg font-semibold mt-6 mb-3">
                6. Updates to Our Privacy Policy
              </h2>
              <p className="mb-4 text-[14px] text-gray-700">
                We may update this Privacy Policy periodically to reflect
                changes in our practices or for legal and regulatory reasons.
                Please review this page regularly to stay informed.
              </p>

              <h2 className="text-lg font-semibold mt-6 mb-3">7. Contact Us</h2>
              <p className="mb-4 text-[14px] text-gray-700">
                If you have any questions or concerns about this Privacy Policy
                or how your data is handled, feel free to contact us at:
                <br />
                <strong>Email:</strong> support@Ayoob.com
                <br />
                <strong>Phone:</strong> +1 (123) 456-7890
              </p>
            </div>
          </div>
        </div>
        {/* -------------Handle Product Modal------------ */}
        {addPrivacy && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <PrivacyModal
              setAddPrivacy={setAddPrivacy}
              privacyId={privacyId}
              setPrivacyId={setPrivacyId}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
