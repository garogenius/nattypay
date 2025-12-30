"use client";

import React from "react";
import { CgClose } from "react-icons/cg";

interface SetSecurityQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (q1: {question: string; answer: string}, q2: {question: string; answer: string}, q3: {question: string; answer: string}) => Promise<void> | void;
}

const SetSecurityQuestionsModal: React.FC<SetSecurityQuestionsModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [qs, setQs] = React.useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const [submitting, setSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const valid = qs.every(q => q.question.trim() && q.answer.trim());

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    try {
      setSubmitting(true);
      if (onSubmit) await onSubmit(qs[0], qs[1], qs[2]);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const options = ["Reason 1", "Reason 2", "Reason 3", "Reason 4"];

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 pt-4 pb-5 w-full max-w-lg max-h-[92vh] rounded-2xl overflow-auto">
        <button onClick={onClose} className="sticky top-3 right-3 float-right p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-3 clear-both">
          <h2 className="text-white text-base sm:text-lg font-semibold">Set Security Question</h2>
          <p className="text-white/60 text-sm">Add an extra layer of protection with a security question</p>
        </div>

        <div className="px-5 sm:px-6 space-y-4">
          {qs.map((q, i)=> (
            <div key={i} className="space-y-2">
              <label className="block text-sm text-white/80">Question {i+1}</label>
              <div className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg">
                <select
                  className="w-full bg-transparent outline-none border-none text-white/90 text-sm py-3.5 px-3 appearance-none"
                  value={q.question}
                  onChange={(e)=> setQs(prev=> { const cp=[...prev]; cp[i] = { ...cp[i], question: e.target.value }; return cp; })}
                >
                  <option value="" className="bg-bg-2400">Select a question</option>
                  {options.map(opt=> <option className="bg-bg-2400" key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                <input
                  type="text"
                  placeholder="Enter answer"
                  className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                  value={q.answer}
                  onChange={(e)=> setQs(prev=> { const cp=[...prev]; cp[i] = { ...cp[i], answer: e.target.value }; return cp; })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 sm:px-6 pt-4">
          <button onClick={handleSubmit} disabled={!valid || submitting} className={`w-full rounded-xl py-3 font-semibold ${!valid || submitting ? "bg-[#D4B139]/60 text-black/70" : "bg-[#D4B139] hover:bg-[#c7a42f] text-black"}`}>{submitting?"Updating...":"Update Question"}</button>
        </div>
      </div>
    </div>
  );
};

export default SetSecurityQuestionsModal;
