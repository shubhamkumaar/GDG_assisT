import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { isSidebarState } from '../features/isSidebar/isSidebarSlice';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/jwt';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function AssignmentFeedback() {
    
    const [feedbackData, setFeedbackData] = useState({
        score: 0,
        max_score: 0,
        summary_bullets: [],
        detailed_feedback: []
    });
    const [expandedItems, setExpandedItems] = useState([]);

    const token = getToken();
    const { state } = useLocation();
    const submission_id = state?.id;

    useEffect(() => {
        const getResult = async () => {
            try {
                const response = await axios.get(`${API_URL}/feedback`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    params: {
                        submission_id: submission_id,
                    }
                });
                setFeedbackData(response.data);
            } catch (error) {
                console.error("Error fetching feedback:", error);
            }
        };
        getResult();
    }, [submission_id, token]);

    const toggleExpand = (questionId) => {
        setExpandedItems(prev => 
            prev.includes(questionId) 
                ? prev.filter(id => id !== questionId) 
                : [...prev, questionId]
        );
    };

    const dispatch = useDispatch();

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
                    <div >
                    </div>
                </div>
            </div>

            <div className="absolute top-[14vh] h-[82vh] overflow-auto space-y-6 hide-scrollbar w-full px-4">

                {feedbackData.detailed_feedback.map((item) => {
                    const isExpanded = expandedItems.includes(item.question_id);
                    return (
                        <div
                            key={item.question_id}
                            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 mb-6 cursor-pointer ${isExpanded ? 'border-l-4 border-[#545e79]' : ''}`}
                            onClick={() => toggleExpand(item.question_id)}
                        >
                            <div className="flex justify-between items-center p-6">
                                <h3 className="text-lg font-bold text-[#8591ad]">Question {item.question_id}</h3>
                                <div className="text-green-400 text-sm font-bold">
                                    Score: {item.score_summary.final_score}
                                </div>
                            </div>

                            <div
                                className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[5000px] p-6' : 'max-h-0'}`}
                            >
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-[#545e79] mb-2">Overall Feedback</h4>
                                    <p className="w-full text-[#8591ad] p-2 bg-gray-50 rounded">
                                        {item.feedback}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-[#545e79] mb-3">Grading Analysis</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {item.grading_analysis.map((analysis, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-50 p-4 rounded shadow-sm"
                                            >
                                                <p className="font-medium text-[#8591ad]">
                                                    {analysis.category}
                                                </p>
                                                <p className="text-green-400 font-bold">
                                                    {analysis.score}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {item.strengths?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-md font-semibold text-[#545e79] mb-2">Strengths</h4>
                                        <div className="space-y-2">
                                            {item.strengths.map((strength, index) => (
                                                <p 
                                                    key={index}
                                                    className="w-full text-[#8591ad] p-2 bg-gray-50 rounded"
                                                >
                                                    • {strength}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {item.areas_of_improvement?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-md font-semibold text-[#545e79] mb-2">Areas for Improvement</h4>
                                        <div className="space-y-2">
                                            {Array.isArray(item.areas_of_improvement) ? (
                                                <>
                                                {item.areas_of_improvement.map((area, index) => (
                                                    <p
                                                        key={index}
                                                        className="w-full text-[#8591ad] p-2 bg-gray-50 rounded"
                                                    >
                                                        • {area}
                                                    </p>
                                                ))}
                                                </>
                                            ) : (
                                            <p className="w-full text-[#8591ad] p-2 bg-gray-50 rounded">
                                                {item.areas_of_improvement}
                                            </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-sm font-semibold text-[#8591ad]">
                                        Rubric Score: {item.score_summary.rubric_score}
                                    </span>
                                    <span className="text-sm font-bold text-[#8591ad]">
                                        Final Score: {item.score_summary.final_score}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-[#545e79] mb-4">Summary Feedback</h3>
                    <div className="space-y-3">
                        {feedbackData.summary_bullets.map((bullet, index) => (
                            <div key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <p className="w-full text-[#8591ad] p-1">
                                    {bullet}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

//AssignmentFeedback