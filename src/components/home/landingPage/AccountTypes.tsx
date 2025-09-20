"use client";

import SectionWrapper from "@/utils/hoc/SectionWrapper";
import { motion } from "framer-motion";
import { staggerContainer, textVariant, scaleVariants } from "@/utils/motion";
import { FiUser, FiMoreHorizontal, FiChevronRight } from "react-icons/fi";
import { MdBusinessCenter } from "react-icons/md";
import { RiHandCoinLine } from "react-icons/ri";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";

// Helper feature row
const FeatureRow = ({
  label,
  active,
  rightIcon,
}: {
  label: string;
  active?: boolean;
  rightIcon?: React.ReactNode;
}) => (
  <div
    className={`w-full flex items-center justify-between rounded-xl px-3 py-3 border ${
      active
        ? "bg-secondary text-black border-secondary"
        : "bg-bg-600 dark:bg-bg-1200 border-border-400/60 text-text-200 dark:text-text-400"
    }`}
  >
    <span className="text-sm">{label}</span>
    <span className="text-text-1700 dark:text-text-800">{rightIcon || <FiMoreHorizontal />}</span>
  </div>
);

const AccountTypes = () => {
  const navigate = useNavigate();
  return (
    <section className="w-full flex justify-center">
      <motion.div
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="w-full"
      >
        {/* Top band with title */}
        <div className="w-full flex justify-center">
          <div className="w-full">
            <div className="w-[90%] lg:w-[88%] mx-auto py-10 sm:py-14 lg:py-16 flex flex-col items-center text-center gap-3">
              <span className="h-1.5 w-20 rounded-full bg-primary" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-200 dark:text-text-400">
                Banking designed for personal and business growth
              </h2>
              <p className="max-w-3xl text-sm sm:text-base text-text-1700 dark:text-text-800">
                Financial solutions that empower both businesses and individuals to thrive and achieve remarkable
                milestones.
              </p>
            </div>
          </div>
        </div>

        {/* Cards row */}
        <div className="w-full mt-2 sm:mt-3 lg:mt-4 flex justify-center pb-12 sm:pb-16 lg:pb-20">
          <div className="w-[90%] lg:w-[88%] grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 items-end gap-4 sm:gap-5 lg:gap-6">
            {/* Personal account */}
            <motion.div
              variants={scaleVariants}
              whileInView={scaleVariants.whileInView}
              className="rounded-2xl bg-bg-600 dark:bg-bg-1100 p-5 sm:p-6 flex flex-col gap-4 border border-border-400/60 min-h-[320px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-primary/70 text-primary flex items-center justify-center bg-primary/5">
                  <FiUser />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-text-200 dark:text-text-400">Personal account</h3>
                  <p className="text-xs sm:text-sm text-text-1700 dark:text-text-800">
                    Open a personal account to manage your
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <FeatureRow label="Bill payments" active />
                <FeatureRow label="Personal Savings" />
                <FeatureRow label="QRCode Payments" rightIcon={<FiChevronRight />} />
                <FeatureRow label="Savings & Investments" />
                <FeatureRow label="Instant Virtual Cards" />
                <FeatureRow label="Healthcare & Insurance" />
              </div>
            </motion.div>

            {/* Business account */}
            <motion.div
              variants={scaleVariants}
              whileInView={scaleVariants.whileInView}
              className="rounded-2xl bg-bg-600 dark:bg-bg-1100 p-5 sm:p-6 flex flex-col gap-4 border border-border-400/60 min-h-[400px] sm:min-h-[420px] lg:-mt-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-primary/70 text-primary flex items-center justify-center bg-primary/5">
                  <MdBusinessCenter className="text-lg" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-text-200 dark:text-text-400">Business account</h3>
                  <p className="text-xs sm:text-sm text-text-1700 dark:text-text-800">
                    Take your business to the next level
                  </p>
                </div>
              </div>
              {/* mini expense widget */}
              <div className="rounded-xl border border-border-400/60 bg-bg-600 dark:bg-bg-1200 p-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] text-text-1700 dark:text-text-800">Total Expenses</span>
                  <span className="text-base sm:text-lg font-bold text-text-200 dark:text-text-400">₦82,000.40</span>
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-primary/30 flex items-center justify-center text-[11px] text-text-200">
                  85%
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <FeatureRow label="Invoices" />
                <FeatureRow label="Payment links" />
                <FeatureRow label="Savings & Investments" />
                <FeatureRow label="Instant Virtual Cards" />
                <FeatureRow label="Healthcare & Insurance" />
              </div>
            </motion.div>

            {/* Loan */}
            <motion.div
              variants={scaleVariants}
              whileInView={scaleVariants.whileInView}
              className="rounded-2xl bg-bg-600 dark:bg-bg-1100 p-5 sm:p-6 flex flex-col gap-4 border border-border-400/60 min-h-[320px] sm:min-h-[360px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-primary/70 text-primary flex items-center justify-center bg-primary/5">
                  <RiHandCoinLine className="text-lg" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-text-200 dark:text-text-400">Loan</h3>
                  <p className="text-xs sm:text-sm text-text-1700 dark:text-text-800">
                    Options tailored to help you achieve your goals
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-text-1700 dark:text-text-800">Select Loan Amount</label>
                <div className="rounded-xl border border-border-400/60 bg-bg-600 dark:bg-bg-1200 px-3 py-3 text-text-200 dark:text-text-400">
                  ₦2,000,000
                </div>
              </div>
              <CustomButton onClick={() => navigate('/loans')} className="rounded-3xl px-5 py-2.5 bg-secondary text-black">
                Apply Now
              </CustomButton>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default SectionWrapper(AccountTypes, "account-types");
