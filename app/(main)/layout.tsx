import Header from "@/components/Header";
import Spotlight from "@/components/ui/spotlight";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header showSearch={false} />
      <Spotlight />
      {children}
    </>
  );
}
