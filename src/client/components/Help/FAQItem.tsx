import React, { useState } from 'react';
import VideoEmbed from './VideoEmbed';

interface FAQItemProps {
  question: string;
  answer: string;
  videoId?: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, videoId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left focus:outline-none group"
      >
        <span className="font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
          {question}
        </span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] mt-2' : 'max-h-0'}`}>
        <p className="text-sm text-slate-600 leading-relaxed mb-2">
          {answer}
        </p>
        {videoId && <VideoEmbed videoId={videoId} />}
      </div>
    </div>
  );
};

export default FAQItem;
