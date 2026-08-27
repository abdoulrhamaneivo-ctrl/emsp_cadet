import React from "react";
import Button from "./Button";

export default function ContactForm() {
  const budgets = [
    "Select budget...",
    "$500",
    "$1000-$2000",
    "$2000-$4000",
    "$5000+",
  ];

  return (
    <div
      className="bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)] rounded-lg p-5"
    >
      <form className="flex flex-col gap-8">
        {/* name and email inputs */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            <label htmlFor="name" id="name">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              className="px-5 py-4 shadow rounded-lg bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)]"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="email" id="email">
              Email
            </label>
            <input
              type="text"
              name="email"
              id="email"
              placeholder="Enter your email"
              className="px-5 py-4 shadow rounded-lg bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)]"
            />
          </div>
        </div>
        {/* subject and budget inputs */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            <label htmlFor="subject" id="subject">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              placeholder="Subject"
              className="px-5 py-4 shadow rounded-lg bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)]"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="budget" id="budget">
              Budget
            </label>
            <select
              name="budget"
              id="budget"
              className="px-5 py-4 shadow rounded-lg bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)]"
            >
              {budgets.map((budget, i) => (
                <option key={i} className="py-4 rounded-xl">
                  {budget}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="comment" id="comment">
            Comment
          </label>
          <textarea
            type="text"
            name="comment"
            id="comment"
            placeholder="Type details about your inquiry"
            cols="50"
            rows="5"
            className="px-5 py-4 shadow rounded-lg bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)]"
          />
        </div>
        <Button
          bgColor="bg-blue-600"
          textColor="text-white"
          title="Send Message"
        />
      </form>
    </div>
  );
}
