function About() {
  const features = [
    {
      icon: "📈",
      title: "PRICE PREDICTION",
      description:
        "Uses a GRU-based machine learning model to estimate the next 15-minute Bitcoin price direction.",
      status: "MODEL INTEGRATED",
    },
    {
      icon: "🐋",
      title: "WHALE ACTIVITY",
      description:
        "A dedicated section for exploring large cryptocurrency transactions and whale movements.",
      status: "ACTIVITY MODULE",
    },
    {
      icon: "⚠️",
      title: "ANOMALY DETECTION",
      description:
        "Identifies unusual market patterns using a trained anomaly detection model.",
      status: "MODEL INTEGRATED",
    },
    {
      icon: "🛡️",
      title: "RISK ANALYSIS",
      description:
        "Estimates market risk using a machine learning model and displays risk assessment history.",
      status: "MODEL INTEGRATED",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-[10px] text-orange-400 tracking-[0.35em]">
            SYSTEM INFORMATION / ABOUT
          </p>

          <h1 className="text-3xl md:text-4xl font-black tracking-wider mt-3">
            ABOUT <span className="text-orange-400">CRYPTOAI</span>
          </h1>

          <p className="text-sm text-gray-500 mt-3 max-w-2xl leading-6">
            A Bitcoin intelligence platform designed to analyze market data and
            present machine learning-based insights in one terminal.
          </p>
        </div>

        <div className="border border-orange-500/20 bg-[#090909] rounded-md p-6 md:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />

          <div className="flex items-start gap-5">
            <div className="text-5xl text-orange-400 drop-shadow-[0_0_12px_rgba(247,147,26,0.4)]">
              ₿
            </div>

            <div>
              <p className="text-xs font-bold text-orange-400 tracking-[0.25em] mb-3">
                OUR PURPOSE
              </p>

              <h2 className="text-lg md:text-xl font-bold mb-3">
                Turning Bitcoin Market Data Into Insights
              </h2>

              <p className="text-sm text-gray-400 leading-7">
                CryptoAI combines live Bitcoin market data with machine learning
                models to help users explore price direction, unusual market
                activity, and potential market risk. It brings these analytical
                tools together in a single dashboard for easier monitoring and
                understanding.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold tracking-[0.2em]">
            CORE CAPABILITIES
          </h2>
          <div className="flex-1 h-px bg-orange-500/15" />
          <span className="text-[9px] text-gray-600">MODULES / 04</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#090909] border border-gray-900 hover:border-orange-500/30 rounded-md p-5 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-orange-500/10 border border-orange-500/20 rounded-md text-xl">
                  {feature.icon}
                </div>

                <h3 className="text-xs font-bold tracking-wider text-gray-200">
                  {feature.title}
                </h3>
              </div>

              <p className="text-xs text-gray-500 leading-6 min-h-[72px]">
                {feature.description}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-900">
                <span className="text-[9px] text-green-400 tracking-[0.2em]">
                  ● {feature.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border border-gray-900 bg-[#080808] rounded-md p-5">
          <p className="text-[10px] text-orange-400 tracking-[0.25em] mb-4">
            TECHNOLOGY STACK
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "REACT",
              "TAILWIND CSS",
              "NODE.JS",
              "EXPRESS",
              "MONGODB",
              "PYTHON",
              "FLASK",
              "TENSORFLOW",
              "BINANCE API",
              "WEBSOCKET",
            ].map((technology) => (
              <span
                key={technology}
                className="px-3 py-2 bg-[#050505] border border-gray-800 text-[9px] tracking-wider text-gray-400"
              >
                {technology}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 mb-4 text-center">
          <p className="text-[9px] text-gray-600 tracking-[0.25em]">
            CRYPTOAI // BITCOIN INTELLIGENCE TERMINAL
          </p>
          <p className="text-[9px] text-gray-700 mt-2">
            Analytical insights only — not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
