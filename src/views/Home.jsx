"use client";

import LeftCol from "../components/LeftCol.jsx";
import MiddleCol from "../components/MiddleCol.jsx";
import RightCol from "../components/RightCol.jsx";
import HomeMobileLayout from "../components/HomeMobileLayout.jsx";

export default function HomeView() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="md:hidden">
        <HomeMobileLayout />
      </div>

      <main className="hidden w-full max-w-400 gap-5 px-4 py-5 mx-auto md:flex xl:flex-row xl:items-start">
        <LeftCol />
        <MiddleCol />
        <RightCol />
      </main>
    </div>
  );
}
