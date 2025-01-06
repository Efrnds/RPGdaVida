import LeftCol from "../components/LeftCol.jsx";
import MiddleCol from "../components/MiddleCol.jsx";
import RightCol from "../components/RightCol.jsx";

export default function Home() {
  return (
    <main className="flex w-screen gap-4 p-4 justify-evenly">
      <LeftCol />
      <MiddleCol />
      <RightCol />
    </main>
  );
}
