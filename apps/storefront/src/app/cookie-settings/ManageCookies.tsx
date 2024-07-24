"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Messages } from "@/lib/util";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

interface Props {
  messages: Messages;
}

const ManageCookies: React.FC<Props> = ({ messages }) => {
  const [analyticalCookies, setAnalyticalCookies] = useState(false);
  const [marketingCookies, setMarketingCookies] = useState(false);
  const [showEssentialCookies, setShowEssentialCookies] = useState(false);

  useEffect(() => {
    const analyticalCookie = Cookies.get("analytics-cookies");
    const marketingCookie = Cookies.get("marketing-cookies");

    if (analyticalCookie === "accepted") {
      setAnalyticalCookies(true);
    }
    if (marketingCookie === "accepted") {
      setMarketingCookies(true);
    }
  }, []);

  const handleAnalyticalCookiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setAnalyticalCookies(isChecked);
    Cookies.set("analytics-cookies", isChecked ? "accepted" : "declined", { expires: 365 });
  };

  const handleMarketingCookiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setMarketingCookies(isChecked);
    Cookies.set("marketing-cookies", isChecked ? "accepted" : "declined", { expires: 365 });
  };

  const toggleEssentialCookies = () => {
    setShowEssentialCookies(!showEssentialCookies);
  };
  return (
    <div className="flex flex-col space-y-12 pt-4">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-semibold pb-2">
              {messages["app.consent.essentialCookiesTitle"]}
            </h2>
            <p className="text-gray-600 text-md">{messages["app.consent.essentialCookiesText"]}</p>
          </div>
          <div>
            <p className="text-md text-main-1 font-bold">{messages["app.consent.essential"]}</p>
          </div>
        </div>
        <div>
          <button
            onClick={toggleEssentialCookies}
            className="flex justify-between items-center py-2 my-4 text-left text-md font-medium text-action-1 hover:text-black focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
          >
            {showEssentialCookies ? (
              <>
                <span>{messages["app.consent.hideCookies"]}</span>
                <ChevronUpIcon className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                <span>{messages["app.consent.showCookies"]}</span>
                <ChevronDownIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
          {showEssentialCookies && (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cookie
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {messages["app.consent.pupose"]}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {messages["app.consent.duration"]}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <strong>saleor_auth_module_auth_state</strong>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {messages["app.consent.cookie.authSDK"]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {messages["app.consent.sessionBased"]}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <strong>refreshToken</strong>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {messages["app.consent.cookie.refreshToken"]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      1 {messages["app.consent.month"]}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <strong>checkoutId</strong>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {messages["app.consent.cookie.checkout"]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {messages["app.consent.cookie.checkoutDur"]}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="md:max-w-[75%]">
          <h2 className="text-4xl font-semibold pb-2">
            {messages["app.consent.analyticalCookiesTitle"]}
          </h2>
          <p className="text-gray-600 text-md">{messages["app.consent.analyticalCookiesText1"]}</p>
          <p className="text-gray-600 text-md">{messages["app.consent.analyticalCookiesText2"]}</p>
        </div>
        <div>
          <label className="switch">
            <input
              type="checkbox"
              checked={analyticalCookies}
              onChange={handleAnalyticalCookiesChange}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="md:max-w-[75%]">
          <h2 className="text-4xl font-semibold pb-2">
            {messages["app.consent.marketingCookiesTitle"]}
          </h2>
          <p className="text-gray-600 text-md">{messages["app.consent.marketingCookiesText1"]}</p>
          <p className="text-gray-600 text-md">{messages["app.consent.marketingCookiesText2"]}</p>
        </div>
        <div>
          <label className="switch">
            <input
              type="checkbox"
              checked={marketingCookies}
              onChange={handleMarketingCookiesChange}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ManageCookies;
