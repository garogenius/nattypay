"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import SuccessToast from "@/components/toast/SuccessToast";
import ErrorToast from "@/components/toast/ErrorToast";

interface SetSecurityQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (q1: {question: string; answer: string}, q2: {question: string; answer: string}, q3: {question: string; answer: string}) => Promise<void> | void;
}

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was the name of your elementary school?",
  "What was your mother's maiden name?",
  "What was the name of the street you grew up on?",
  "What was your favorite food as a child?",
  "What was the make of your first car?",
  "What was your childhood nickname?",
  "What is the name of your favorite teacher?",
  "What was the name of your best friend in high school?",
  "What is your favorite movie?",
  "What is the name of your first employer?",
  "What was your favorite sport in high school?",
  "What is your favorite book?",
  "What is the name of the hospital where you were born?",
];

const STORAGE_KEY = "nattypay_security_questions";

const SetSecurityQuestionsModal: React.FC<SetSecurityQuestionsModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [qs, setQs] = React.useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{question?: string; answer?: string}[]>([]);

  // Load existing questions on open
  React.useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length === 3) {
            setQs(parsed);
          }
        }
      } catch {
        // Ignore parse errors
      }
      setErrors([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: {question?: string; answer?: string}[] = [];
    let isValid = true;

    qs.forEach((q, i) => {
      const error: {question?: string; answer?: string} = {};
      
      if (!q.question.trim()) {
        error.question = "Please select a question";
        isValid = false;
      }

      if (!q.answer.trim()) {
        error.answer = "Please enter an answer";
        isValid = false;
      } else if (q.answer.trim().length < 3) {
        error.answer = "Answer must be at least 3 characters";
        isValid = false;
      } else if (q.answer.trim().length > 100) {
        error.answer = "Answer must be less than 100 characters";
        isValid = false;
      }

      // Check for duplicate questions
      const duplicateIndex = qs.findIndex((other, idx) => idx !== i && other.question === q.question && q.question);
      if (duplicateIndex !== -1) {
        error.question = "Each question must be unique";
        isValid = false;
      }

      newErrors.push(error);
    });

    setErrors(newErrors);
    return isValid;
  };

  const valid = qs.every(q => q.question.trim() && q.answer.trim()) && errors.length === 0;

  const handleSubmit = async () => {
    if (!validate() || submitting) return;
    
    try {
      setSubmitting(true);
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
      
      // Call onSubmit if provided
      if (onSubmit) {
        await onSubmit(qs[0], qs[1], qs[2]);
      } else {
        SuccessToast({
          title: "Security Questions Saved",
          description: "Your security questions have been successfully saved.",
        });
      }
      
      onClose();
    } catch (error: any) {
      ErrorToast({
        title: "Failed to Save",
        descriptions: [error?.message || "Unable to save security questions. Please try again."],
      });
    } finally {
      setSubmitting(false);
    }
  };

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
              <label className="block text-sm text-white/80 font-medium">
                Security Question {i+1} <span className="text-red-400">*</span>
              </label>
              <div className="w-full bg-bg-2400 dark:bg-bg-2100 border rounded-lg">
                <select
                  className={`w-full bg-transparent outline-none border-none text-white/90 text-sm py-3.5 px-3 appearance-none ${
                    errors[i]?.question ? "border-red-500" : ""
                  }`}
                  value={q.question}
                  onChange={(e)=> {
                    setQs(prev=> { 
                      const cp=[...prev]; 
                      cp[i] = { ...cp[i], question: e.target.value }; 
                      return cp; 
                    });
                    // Clear error when user selects
                    if (errors[i]?.question) {
                      setErrors(prev => {
                        const newErrors = [...prev];
                        newErrors[i] = { ...newErrors[i], question: undefined };
                        return newErrors;
                      });
                    }
                  }}
                >
                  <option value="" className="bg-bg-2400 text-white/50">Select a security question</option>
                  {SECURITY_QUESTIONS.map(opt=> (
                    <option className="bg-bg-2400" key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {errors[i]?.question && (
                <p className="text-red-400 text-xs">{errors[i].question}</p>
              )}
              
              <div>
                <label className="block text-sm text-white/80 font-medium mb-2">
                  Your Answer <span className="text-red-400">*</span>
                </label>
                <div className={`w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border rounded-lg py-3.5 px-3 ${
                  errors[i]?.answer ? "border-red-500" : "border-border-600"
                }`}>
                  <input
                    type="text"
                    placeholder="Enter your answer"
                    className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                    value={q.answer}
                    onChange={(e)=> {
                      setQs(prev=> { 
                        const cp=[...prev]; 
                        cp[i] = { ...cp[i], answer: e.target.value }; 
                        return cp; 
                      });
                      // Clear error when user types
                      if (errors[i]?.answer) {
                        setErrors(prev => {
                          const newErrors = [...prev];
                          newErrors[i] = { ...newErrors[i], answer: undefined };
                          return newErrors;
                        });
                      }
                    }}
                    maxLength={100}
                  />
                </div>
                {errors[i]?.answer && (
                  <p className="text-red-400 text-xs mt-1">{errors[i].answer}</p>
                )}
                <p className="text-white/50 text-xs mt-1">
                  {q.answer.length}/100 characters
                </p>
              </div>
            </div>
          ))}
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4">
            <p className="text-blue-300 text-xs">
              <strong className="font-semibold">Security Tip:</strong> Choose questions and answers that are easy for you to remember but difficult for others to guess. Your answers are case-sensitive.
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-4 pb-2">
          <button 
            onClick={handleSubmit} 
            disabled={!valid || submitting} 
            className={`w-full rounded-xl py-3 font-semibold transition-colors ${
              !valid || submitting 
                ? "bg-[#D4B139]/60 text-black/70 cursor-not-allowed" 
                : "bg-[#D4B139] hover:bg-[#c7a42f] text-black"
            }`}
          >
            {submitting ? "Saving..." : "Save Security Questions"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetSecurityQuestionsModal;
