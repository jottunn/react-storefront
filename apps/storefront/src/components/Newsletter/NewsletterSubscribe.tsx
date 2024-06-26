"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { Messages } from "@/lib/util";
import Link from "next/link";
import Spinner from "../Spinner";
interface NewsletterSubscribeProps {
  messages: Messages;
}
const NewsletterSubscribe = ({ messages }: NewsletterSubscribeProps) => {
  const [email, setEmail] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (name) {
      setLoading(false);
      setMessage({ text: messages["app.nwl.err"], type: "error" });
      return;
    }
    if (!agreedToTerms) {
      setLoading(false);
      setMessage({ text: messages["app.nwl.errGdpr"], type: "error" });
      return;
    }
    try {
      const response: any = await axios.post("/api/subscribe", { email });
      setLoading(false);
      if (
        response.data.message === "duplicate_parameter" ||
        response.message === "duplicate_parameter"
      ) {
        setMessage({ text: messages["app.nwl.exist"], type: "error" });
      } else {
        setMessage({ text: messages["app.nwl.succes"], type: "success" });
      }
      setEmail("");
      setAgreedToTerms(false);
    } catch (error) {
      setLoading(false);
      setMessage({ text: messages["app.nwl.err"], type: "error" });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-left">{messages["app.nwl.title"]}</h2>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={messages["app.nwl.email"]}
          required
          className="flex-grow p-2 border border-gray-300 text-base"
        />
        <div style={{ display: "none" }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Please enter your name"
          />
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <button
            type="submit"
            className="bg-black text-white p-2 text-base hover:opacity-75 transition-opacity uppercase"
          >
            {messages["app.nwl.btn"]}
          </button>
        )}
      </form>
      <div className="mt-2 flex items-start">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mr-2 mt-2 text-base"
        />
        <label className="text-gray-600 text-base text-main-1">
          {messages["app.nwl.gdpr"]}{" "}
          <Link href="/prelucrare-date-personale" className="underline hover:text-action-1">
            {messages["app.nwl.terms"]}
          </Link>
        </label>
      </div>
      {message && (
        <p
          className={`mt-4 text-left text-base font-bold ${message.type === "error" ? "text-red-500" : "text-action-1"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default NewsletterSubscribe;
