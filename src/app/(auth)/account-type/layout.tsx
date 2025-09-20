
export default function AccountTypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-600 dark:bg-black">
      {/* Page content */}
      <div className="min-h-screen flex items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}
