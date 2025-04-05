
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { isSidebarState } from '../features/isSidebar/isSidebarSlice';

export default function ResultReview() {
    const dispatch = useDispatch();
    const [feedbackData, setFeedbackData] = useState([
        {
            questionId: "Q1",
            rubricScore: "10/10",
            finalScore: "10/10",
            feedback: "This is an excellent answer that demonstrates a strong understanding of strategic planning tools and their practical application in a business context...",
            gradingAnalysis: [
                { category: "Identification & Explanation of Tool 1 (SWOT)", score: "2/2" },
                { category: "Justification of Tool 1 (SWOT)", score: "2/2" },
                { category: "Identification & Explanation of Tool 2 (SMART)", score: "2/2" },
                { category: "Justification of Tool 2 (SMART)", score: "2/2" },
                { category: "Clarity & Relevance", score: "2/2" }
            ],
            strengths: [
                "Clear and Detailed Explanations: You provided thorough explanations of both SWOT analysis and SMART goals...",
                "Relevant and Contextual Application: Your application of both tools to TechGrowth Inc. is highly relevant and practical...",
                "Strong Justification: You effectively justified the use of each tool by clearly explaining why they are valuable for TechGrowth..."
            ],
            areasOfImprovement: "No Areas for Improvement for this near-perfect answer."
        },
        {
            questionId: "Q2",
            rubricScore: "10/10",
            finalScore: "10/10",
            feedback: "Your answer is excellent and demonstrates a strong understanding of organizational structures and their implications for a company like TechGrowth...",
            gradingAnalysis: [
                { category: "Suggestion of Structure 1 (Matrix Structure)", score: "1/1" },
                { category: "Pros of Structure 1", score: "2/2" },
                { category: "Cons of Structure 1", score: "2/2" },
                { category: "Suggestion of Structure 2 (Flat Structure)", score: "1/1" },
                { category: "Pros of Structure 2", score: "2/2" },
                { category: "Cons of Structure 2", score: "2/2" }
            ],
            strengths: [
                "Improved Communication: Facilitates direct communication between members of different departments working on the same project.",
                "Faster Decision-Making: Fewer layers mean information travels faster, and decisions can be made more quickly...",
                "Your discussion of both pros and cons for each structure demonstrates a balanced and critical approach..."
            ],
            areasOfImprovement: [
                "While your answer is comprehensive, consider delving deeper into the conditions under which each structure would be most effective for TechGrowth...",
                "For Matrix Structure: Consider mentioning that it is particularly effective when TechGrowth has numerous complex projects...",
                "For Flat Structure: Note that it works best in smaller to medium-sized organizations or in environments where tasks are relatively routine..."
            ]
        }
    ]);

    const [expandedItems, setExpandedItems] = useState([]);

    const toggleExpand = (questionId) => {
        setExpandedItems(prev => 
            prev.includes(questionId) 
                ? prev.filter(id => id !== questionId) 
                : [...prev, questionId]
        );
    };

    const updateQuestionField = (questionId, field, value) => {
        setFeedbackData(prev => 
            prev.map(item => 
                item.questionId === questionId 
                    ? { ...item, [field]: value } 
                    : item
            )
        );
    };

    const updateGradingAnalysis = (questionId, index, field, value) => {
        setFeedbackData(prev => 
            prev.map(item => {
                if (item.questionId === questionId) {
                    const updatedAnalysis = [...item.gradingAnalysis];
                    updatedAnalysis[index] = { ...updatedAnalysis[index], [field]: value };
                    return { ...item, gradingAnalysis: updatedAnalysis };
                }
                return item;
            })
        );
    };

    const updateArrayField = (questionId, field, index, value) => {
        setFeedbackData(prev => 
            prev.map(item => {
                if (item.questionId === questionId) {
                    const updatedArray = [...item[field]];
                    updatedArray[index] = value;
                    return { ...item, [field]: updatedArray };
                }
                return item;
            })
        );
    };

    const addArrayItem = (questionId, field) => {
        setFeedbackData(prev => 
            prev.map(item => 
                item.questionId === questionId 
                    ? { ...item, [field]: [...item[field], ""] } 
                    : item
            )
        );
    };

    return (
        <div className="relative flex flex-col items-center bg-[#F2F4F8] w-full h-screen">
            <div className='absolute top-0 bg-[#ced3df] w-full h-[10vh]'>
                <div className='flex flex-row items-center justify-between h-[10vh]'>
                    <Link
                        onClick={() => dispatch(isSidebarState(false))}
                        to="..">
                        <img className='h-8 w-8 ml-[1.5rem] cursor-pointer'
                            src="/Goback.svg" alt="Goback" />
                    </Link>
                    <div className="flex flex-row z-10">
                        <div className='text-xl font-semibold text-[#545E79] cursor-pointer'>Subject Name</div>
                    </div>
                    <div></div>
                </div>
            </div>

            <div className="absolute top-[14vh] h-[82vh] overflow-auto space-y-6 hide-scrollbar w-full px-4">
                {feedbackData.map((item) => {
                    const isExpanded = expandedItems.includes(item.questionId);
                    
                    return (
                        <div
                            key={item.questionId}
                            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 mb-6 cursor-pointer border-l-4 ${ isExpanded ? 'border-[#545e79]' : 'border-gray-200'}`}
                            onClick={() => toggleExpand(item.questionId)}
                        >
                            <div className="flex justify-between items-center p-6 bg-gray-50">
                                <h3 className="text-lg font-bold text-[#8591ad]">Question {item.questionId}</h3>
                                <div className="bg-green-400 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    Score: <input 
                                        type="text" 
                                        value={item.finalScore} 
                                        onChange={(e) => updateQuestionField(item.questionId, 'finalScore', e.target.value)}
                                        className="bg-transparent border-none w-10 text-white font-bold"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            <div
                                className={`transition-all duration-300 overflow-hidden ${ isExpanded ? 'max-h-[5000px] p-6' : 'max-h-0'}`}
                            >
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-[#545e79] mb-2">Overall Feedback</h4>
                                    <textarea 
                                        value={item.feedback} 
                                        onChange={(e) => updateQuestionField(item.questionId, 'feedback', e.target.value)}
                                        className="w-full text-[#8591ad] p-2 border border-gray-200 rounded"
                                        rows="3"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-[#545e79] mb-3">Grading Analysis</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {item.gradingAnalysis.map((analysis, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-50 p-4 rounded border-l-4 border-[#8591ad] shadow-sm"
                                            >
                                                <input
                                                    type="text"
                                                    value={analysis.category}
                                                    onChange={(e) => updateGradingAnalysis(item.questionId, index, 'category', e.target.value)}
                                                    className="font-medium text-[#8591ad] bg-transparent border-none w-full"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <input
                                                    type="text"
                                                    value={analysis.score}
                                                    onChange={(e) => updateGradingAnalysis(item.questionId, index, 'score', e.target.value)}
                                                    className="text-green-400 font-bold bg-transparent border-none"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-[#545e79] mb-2">Strengths</h4>
                                    {Array.isArray(item.strengths) ? (
                                        <div className="space-y-2">
                                            {item.strengths.map((strength, index) => (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    value={strength}
                                                    onChange={(e) => updateArrayField(item.questionId, 'strengths', index, e.target.value)}
                                                    className="w-full text-[#8591ad] p-2 border border-gray-200 rounded"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ))}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addArrayItem(item.questionId, 'strengths');
                                                }}
                                                className="mt-2 text-sm text-[#545e79] hover:text-[#8591ad]"
                                            >
                                                + Add Strength
                                            </button>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={item.strengths}
                                            onChange={(e) => updateQuestionField(item.questionId, 'strengths', e.target.value)}
                                            className="w-full text-[#8591ad] p-2 border border-gray-200 rounded"
                                            rows="2"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-[#545e79] mb-2">Areas for Improvement</h4>
                                    {Array.isArray(item.areasOfImprovement) ? (
                                        <div className="space-y-2">
                                            {item.areasOfImprovement.map((area, index) => (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    value={area}
                                                    onChange={(e) => updateArrayField(item.questionId, 'areasOfImprovement', index, e.target.value)}
                                                    className="w-full text-[#8591ad] p-2 border border-gray-200 rounded"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ))}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addArrayItem(item.questionId, 'areasOfImprovement');
                                                }}
                                                className="mt-2 text-sm text-[#545e79] hover:text-[#8591ad]"
                                            >
                                                + Add Improvement Area
                                            </button>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={item.areasOfImprovement}
                                            onChange={(e) => updateQuestionField(item.questionId, 'areasOfImprovement', e.target.value)}
                                            className="w-full text-[#8591ad] p-2 border border-gray-200 rounded"
                                            rows="2"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#545e79]">
                                    <span className="text-sm font-semibold text-[#8591ad]">
                                        Rubric Score: <input 
                                            type="text" 
                                            value={item.rubricScore} 
                                            onChange={(e) => updateQuestionField(item.questionId, 'rubricScore', e.target.value)}
                                            className="bg-transparent border-none w-10"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </span>

                                    <span className="text-sm font-bold text-[#8591ad]">
                                        Final Score: <input 
                                            type="text" 
                                            value={item.finalScore} 
                                            onChange={(e) => updateQuestionField(item.questionId, 'finalScore', e.target.value)}
                                            className="bg-transparent border-none w-10"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}