import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, ArrowRight, Sparkles, Star } from "lucide-react";
import { apiPath } from "../../../utils/apiBase";
import SmileFaceRunner from "../../SmileFaceRunner";
import SmileFaceWormGame from "../../SmileFaceWormGame";

function CyclingMiniGame({ darkMode }) {
  const [game, setGame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setGame(g => (g + 1) % 2), 30000);
    return () => clearInterval(id);
  }, []);
  return game === 0 ? <SmileFaceRunner darkMode={darkMode} /> : <SmileFaceWormGame darkMode={darkMode} />;
}

function SpotTheCue({ lesson, gradeLevel, darkMode, onComplete, preloadedCards }) {
  const [cards, setCards] = useState(preloadedCards || []);
  const [currentCard, setCurrentCard] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(!preloadedCards);
  const [error, setError] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);

  const topic = lesson?.title || lesson?.topic || "Body Language";

  useEffect(() => {
    if (!preloadedCards) {
      generateCards();
    }
  }, []);

  async function generateCards() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(apiPath("/api/spot-the-cue/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, gradeLevel }),
      });
      const data = await res.json();
      if (!data.success || !data.cards?.length) {
        throw new Error(data.error || "Failed to generate cards");
      }
      setCards(data.cards);
    } catch (err) {
      console.error("Spot the Cue load error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelect(index) {
    if (showFeedback) return;
    setSelected(index);
    setShowFeedback(true);
    if (index === cards[currentCard].correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentCard + 1 >= cards.length) {
      setGameComplete(true);
    } else {
      setCurrentCard((c) => c + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  }

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020412] text-white px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Eye className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Spot the Cue
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Generating social scenes for you to analyze...
          </p>
          <CyclingMiniGame darkMode />
          <div className="mx-auto max-w-xs">
            <div className="h-2 rounded-full overflow-hidden bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #a78bfa, #f472b6, #fb923c)",
                  animation: "shimmer 2s linear infinite, grow 20s ease-out forwards",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
          @keyframes grow { from { width: 5%; } to { width: 90%; } }
        `}</style>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020412] text-white px-6">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-red-400">Oops!</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={generateCards}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => onComplete(0)}
            className="block mx-auto text-gray-500 hover:text-gray-300 text-sm mt-2"
          >
            Skip to practice
          </button>
        </div>
      </div>
    );
  }

  // --- Game complete ---
  if (gameComplete) {
    const perfect = score === cards.length;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020412] text-white px-6">
        <div className="text-center space-y-6 max-w-md animate-fade-in">
          <div className="flex justify-center">
            {perfect ? (
              <Star className="w-16 h-16 text-yellow-400 animate-bounce" />
            ) : (
              <Sparkles className="w-16 h-16 text-purple-400" />
            )}
          </div>
          <h1 className="text-4xl font-bold">
            {perfect ? "Perfect Score!" : "Great Job!"}
          </h1>
          <p className="text-xl text-gray-300">
            You spotted{" "}
            <span className="text-purple-300 font-bold">{score}</span> out of{" "}
            <span className="text-purple-300 font-bold">{cards.length}</span>{" "}
            social cues
          </p>
          <p className="text-gray-400">
            {perfect
              ? "You're really good at reading social situations!"
              : "Every time you practice, you get better at noticing these cues."}
          </p>
          <button
            onClick={() => onComplete(score * 10)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-full transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            Continue to Practice
            <ArrowRight className="w-5 h-5 inline ml-2" />
          </button>
        </div>
        <style>{`
          @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.6s ease forwards; }
        `}</style>
      </div>
    );
  }

  // --- Card display ---
  const card = cards[currentCard];
  const isCorrect = selected === card.correctIndex;

  return (
    <div className="min-h-screen bg-[#020412] text-white flex flex-col items-center px-6 py-10 overflow-y-auto">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Spot the Cue
            </h2>
          </div>
          <span className="text-sm text-gray-400">
            {currentCard + 1} / {cards.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentCard + (showFeedback ? 1 : 0)) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden mb-6 border border-white/10 shadow-lg shadow-purple-500/10">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt="Social situation"
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-white/5 flex items-center justify-center">
              <p className="text-gray-500">Image not available</p>
            </div>
          )}
        </div>

        {/* Question */}
        <h3 className="text-xl font-semibold mb-5 leading-relaxed">{card.question}</h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {card.options.map((option, i) => {
            let borderColor = "border-white/10 hover:border-white/30";
            let bg = "bg-white/5 hover:bg-white/10";
            let icon = null;

            if (showFeedback) {
              if (i === card.correctIndex) {
                borderColor = "border-emerald-400";
                bg = "bg-emerald-400/10";
                icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
              } else if (i === selected && !isCorrect) {
                borderColor = "border-red-400";
                bg = "bg-red-400/10";
                icon = <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
              } else {
                bg = "bg-white/3";
                borderColor = "border-white/5";
              }
            } else if (i === selected) {
              borderColor = "border-purple-400";
              bg = "bg-purple-400/10";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={`w-full text-left px-5 py-4 rounded-2xl border ${borderColor} ${bg} transition-all duration-200 flex items-center gap-3 ${
                  showFeedback ? "cursor-default" : "cursor-pointer active:scale-[0.98]"
                }`}
              >
                {icon}
                <span className="text-base">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`rounded-2xl p-5 mb-6 border ${
              isCorrect
                ? "bg-emerald-400/10 border-emerald-400/30"
                : "bg-orange-400/10 border-orange-400/30"
            }`}
          >
            <p className="font-semibold mb-1">
              {isCorrect ? "You got it!" : "Not quite — here's what to look for:"}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">{card.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {showFeedback && (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/20"
          >
            {currentCard + 1 >= cards.length ? "See Results" : "Next Cue"}
            <ArrowRight className="w-5 h-5 inline ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SpotTheCue;
