import Sidebar from "@/components/user/sidebar/Sidebar";
import Content from "@/components/user/content";
import UserProtectionProvider from "@/providers/UserProtectionProvider";

export default function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <UserProtectionProvider>
      <div className="relative flex w-full h-screen overflow-hidden bg-bg-400 dark:bg-black gap-0">
        <Sidebar />
        <div className="hidden lg:block w-[10px] bg-black" />
        <Content>{children}</Content>
      </div>
    </UserProtectionProvider>
  );
}
