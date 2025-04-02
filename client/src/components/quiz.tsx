import React, { useState } from "react";

interface Question {
  question: string;
  options: { [key: string]: string };
  answer: string;
}

const questions: Question[] = [
  {
    question: "In object-oriented programming, what are the basic run-time entities called?",
    options: {
      a: "Classes",
      b: "Objects",
      c: "Functions",
      d: "Variables",
    },
    answer: "b",
  },
  {
    question: "Which concept in OOP combines data and functions into a single unit?",
    options: {
      a: "Inheritance",
      b: "Polymorphism",
      c: "Encapsulation",
      d: "Abstraction",
    },
    answer: "c",
  },
];


const Quiz: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleSelectAnswer = (key: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: key }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    setSubmitted(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setFinished(true);
    submitQuizAnswers(selectedAnswers);
  };

  // Function to send answers to the server
  const submitQuizAnswers = (answers: { [key: number]: string }) => {
    console.log("Submitting answers to server:", answers);
    // Implement API call here
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex justify-center items-center h-screen bg-[#f2f4f8]">
      <div className="w-[400px] p-8 bg-[#ced3df] rounded-3xl shadow-xl">
        <h2 className="text-2xl font-semibold text-[#545e79] text-center">Quiz Time! 🎯</h2>
        {!finished ? (
          <>
            <p className="text-[#8591ad] mt-4 text-lg font-medium">{currentQuestion.question}</p>

            <div className="mt-6 space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border 
                    ${
                      selectedAnswers[currentIndex] === key
                        ? "bg-[#8591ad] text-white border-[#8591ad] shadow-lg"
                        : "bg-[#aab2c6] text-[#545e79] border-transparent hover:bg-[#8591ad] hover:text-white hover:border-[#8591ad]"
                    }`}
                >
                  <input
                    type="radio"
                    name={`quiz-${currentIndex}`}
                    value={key}
                    className="hidden"
                    onChange={() => handleSelectAnswer(key)}
                    disabled={submitted}
                  />
                  {value}
                </label>
              ))}
            </div>

            <button
              className="w-full mt-6 py-3 bg-[#545e79] text-white text-lg font-semibold rounded-lg 
                transition-all hover:bg-[#8591ad] active:scale-95 shadow-md"
              onClick={submitted ? handleNext : handleSubmit}
              disabled={!selectedAnswers[currentIndex]}
            >
              {submitted ? (currentIndex < questions.length - 1 ? "Next" : "Finish") : "Submit"}
            </button>

            {submitted && (
              <div className="mt-4 text-center">
                <p
                  className={`font-bold ${
                    selectedAnswers[currentIndex] === currentQuestion.answer ? "text-[#545e79]" : "text-red-600"
                  }`}
                >
                  {selectedAnswers[currentIndex] === currentQuestion.answer ? "Correct!" : "Wrong Answer"}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-[#545e79] text-center text-lg font-bold">Your answers have been submitted! ✅</p>
        )}
      </div>
    </div>
  );
};

export default Quiz;
