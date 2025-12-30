import QuickAccess from "./QuickAccess";
import RecentTransactions from "./RecentTransactions";
import StatsContent from "./stats/StatsContent";
import PortfolioCard from "./stats/PortfolioCard";

const VerifiedDashboard = () => {
  return (
    <div className="w-full flex flex-col md:gap-10 gap-8">
      {/* Quick actions section */}
      <QuickAccess />

      {/* Recent transactions and analytics side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="order-2 lg:order-1 h-full">
          <RecentTransactions />
        </div>
        <div className="order-1 lg:order-2 h-full">
          <StatsContent key="analytics-v2" />
        </div>
      </div>

      {/* Portfolio card below the alignment line */}
      <PortfolioCard />
    </div>
  );
};

export default VerifiedDashboard;
