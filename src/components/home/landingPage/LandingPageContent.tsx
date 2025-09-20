import Contact from "./Contact";
import Faqs from "./faqs/Faqs";
import Heroarea from "./Heroarea";
import Providers from "./Providers";
import AccountTypes from "./AccountTypes";
import ApiSection from "./ApiSection";
import Testimonials from "./Testimonials";
import About from "./About";
import Services from "./Services";
import Wcu from "./Wcu";

const LandingPageContent = () => {
  return (
    <div className="w-full relative z-0 bg-bg-400 dark:bg-black overflow-hidden flex flex-col">
      <Heroarea />
      <Providers />
      <About />
      <AccountTypes />
      <Services />
      <Wcu />
      <ApiSection />
      <Faqs />
      <Contact />
      <Testimonials />
    </div>
  );
};

export default LandingPageContent;
