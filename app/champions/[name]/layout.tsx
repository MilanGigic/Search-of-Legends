import Header from "@/components/Header";

export default function ChampionIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header showSearch={true} />
      {children}
    </>
  );
}
