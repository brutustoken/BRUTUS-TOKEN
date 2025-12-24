import React, { useState } from 'react';

export default function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-300 rounded-xl mb-4 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 transition"
      >
        {question}
      </button>
      {isOpen && (
        <div className="px-4 py-3 text-gray-700 bg-white border-t border-gray-200">
          {answer}
        </div>
      )}
    </div>
  )
}