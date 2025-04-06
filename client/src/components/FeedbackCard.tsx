import { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

export default function FeedbackCard(
    {questionId,rubricScore,finalScore,feedback,gradingAnalysis,strengths,areasOfImprovement,}){
        
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

  return (

    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 mb-6 cursor-pointer border-l-4 ${ expanded ? 'border-[#545e79]' : 'border-gray-200'}`}
      onClick={toggleExpand}
    >
      <div className="flex justify-between items-center p-6 bg-gray-50">
        <h3 className="text-lg font-bold text-[#8591ad]">Question {questionId}</h3>
        <div className="bg-green-400 text-white px-4 py-1 rounded-full text-sm font-bold">
          Score: {finalScore}
        </div>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${ expanded ? 'max-h-[5000px] p-6' : 'max-h-0'}`}
      >
        <div className="mb-6">
          <h4 className="text-md font-semibold text-[#545e79] mb-2">Overall Feedback</h4>
          <p className="text-[#8591ad]">{feedback}</p>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold text-[#545e79] mb-3">Grading Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gradingAnalysis.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded border-l-4 border-[#8591ad] shadow-sm"
              >
                <p className="font-medium text-[#8591ad]">{item.category}</p>
                <p className="text-green-400 font-bold">{item.score}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold text-[#545e79] mb-2">Strengths</h4>
          {Array.isArray(strengths) ? (
            <ul className="list-disc pl-5 space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="text-[#8591ad]">
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#8591ad]">{strengths}</p>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold text-[#545e79] mb-2">Areas for Improvement</h4>
          {Array.isArray(areasOfImprovement) ? (
            <ul className="list-disc pl-5 space-y-2">
              {areasOfImprovement.map((item, index) => (
                <li key={index} className="text-[#8591ad]">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#8591ad]">{areasOfImprovement}</p>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#545e79]">

          <span className="text-sm font-semibold text-[#8591ad]">
            Rubric Score: {rubricScore}
          </span>

          <span className="text-sm font-bold text-[#8591ad]">
            Final Score: {finalScore}
          </span>

        </div>
      </div>
    </div>
    
  );
};