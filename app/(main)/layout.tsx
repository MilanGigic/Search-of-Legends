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
      {children}
    </>
  );
}
