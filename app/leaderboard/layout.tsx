import Header from "@/components/Header";

const LeaderboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <Header showSearch={true} />
      {children}
    </div>
  );
};
export default LeaderboardLayout;
