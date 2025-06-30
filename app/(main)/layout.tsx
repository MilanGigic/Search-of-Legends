import Header from "@/components/Header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header showSearch={false} />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="animated-grid" />
      </div>
      {children}
    </>
  );
}
