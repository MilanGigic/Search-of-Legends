import Sidebar from "@/components/AppSidebar";
import Header from "@/components/Header";

const LeaderboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Header showSearch={true} />
      <Sidebar />
      {children}
    </>
  );
};
export default LeaderboardLayout;
