import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <main className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h1 className="text-6xl font-bold max-w-4xl">
          Smarter Crypto Intelligence
        </h1>

        <p className="mt-6 text-xl text-gray-400 max-w-2xl">
          Predict Bitcoin movements, detect whale activity, identify market
          anomalies, and assess crypto risk using data-driven intelligence.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="px-7 py-3 bg-blue-600 rounded-lg hover:bg-blue-700">
            Get Started
          </button>

          <button className="px-7 py-3 border border-gray-700 rounded-lg hover:bg-gray-800">
            Explore Features
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;
