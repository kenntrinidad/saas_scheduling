import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="min-w-0 flex-1 px-3 pb-6 pt-16 sm:px-6 md:p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}