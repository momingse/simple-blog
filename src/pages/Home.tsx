import { useState } from "react";

export default function Home() {
  const [counter, setCounter] = useState(0);
  return (
    <div className="flex justify-center">
      <h1 className="font-bold text-2xl text-blue-900">
        React and Tailwind with Vitejs!
      </h1>
    </div>
  );
}
