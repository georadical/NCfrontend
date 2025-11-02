import React from "react";

export default function ActionCard({ title, description, button, primary = false }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        className={`mt-4 h-9 rounded-md text-sm font-medium transition ${
          primary
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }`}
      >
        {button}
      </button>
    </div>
  );
}
