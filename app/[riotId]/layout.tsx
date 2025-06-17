import Header from "@/components/Header";

export default function RiotIdLayout({
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
