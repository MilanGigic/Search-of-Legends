import Sidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import UserCard from "@/components/UserCard";

export default function RiotIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header showSearch={true} />
      <Sidebar />
      {children}
    </>
  );
}
