"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { Messages } from "@/lib/util";
import Link from "next/link";
import Spinner from "../Spinner";
import { Button } from "../Button/Button";

const ReturnForm = ({ messages }: { messages: Messages }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    iban: "",
    phone: "",
    reason: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check for empty fields
    for (const key in formData) {
      if (formData[key as keyof typeof formData].trim() === "") {
        setLoading(false);
        setMessage({ text: `Please fill in your ${key}.`, type: "error" });
        return;
      }
    }

    if (!agreedToTerms) {
      setLoading(false);
      setMessage({ text: messages["app.return.errGdpr"], type: "error" });
      return;
    }

    try {
      // Send formData to API
      const response: any = await axios.post("/api/return", formData);
      setLoading(false);
      if (response.data.status === "ok") {
        setMessage({ text: messages["app.return.succes"], type: "success" });
      } else {
        setMessage({ text: messages["app.nwl.exist"], type: "error" });
      }

      //TODO toremove
      console.log("response", response);
      setLoading(false);
      setFormData({
        firstName: "",
        lastName: "",
        iban: "",
        phone: "",
        reason: "",
      });
      setAgreedToTerms(false);
    } catch (error) {
      setLoading(false);
      setMessage({ text: messages["app.nwl.err"], type: "error" });
    }
  };

  return (
    <div className="p-8 border border-gray-200 rounded-md shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          {["lastName", "firstName", "iban", "phone"].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-base font-bold text-gray-700 uppercase">
                {messages[`app.return.${field}`]}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={formData[field as keyof typeof formData]}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md text-base"
              />
            </div>
          ))}
        </div>
        <div className="my-6">
          <label htmlFor="reason" className="block text-base font-bold text-gray-700 uppercase">
            {messages["app.return.reason"]}
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-start mb-6">
          <input
            id="nwl-agree"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mr-2 mt-2"
          />
          <label htmlFor="nwl-agree" className="text-base text-gray-600">
            {messages["app.nwl.gdpr"]}{" "}
            <Link href="/prelucrare-date-personale" className="underline hover:text-action-1">
              {messages["app.nwl.terms"]}
            </Link>
          </label>
        </div>

        <div className="flex justify-start">
          {loading ? (
            <Spinner />
          ) : (
            <Button
              label={messages["app.return.btn"]}
              type="submit"
              variant="tertiary"
              style={{ textTransform: "uppercase" }}
            />
          )}
        </div>
      </form>

      {message && (
        <p
          className={`mt-4 text-base font-bold ${
            message.type === "error" ? "text-red-500" : "text-green-500"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ReturnForm;
