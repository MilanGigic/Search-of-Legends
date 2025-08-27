import HomePageWrapper from "@/components/HomePageWrapper";
export const dynamic = "force-dynamic";
export default async function Home() {
  return (
    <div className="flex justify-center items-center mx-auto bg-gradient-to-br from-[#121624] to-[#1B1F35]/20">
      <HomePageWrapper />
    </div>
  );
}
