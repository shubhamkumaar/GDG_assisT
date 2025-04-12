import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { isSidebarState } from '../features/isSidebar/isSidebarSlice';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/jwt';
import { useLocation } from 'react-router-dom';
import Markdown from "markdown-to-jsx"
    // import ReactMarkdown from 'react-markdown'

const API_URL = import.meta.env.VITE_API_URL;
export default function ResultReview() {
    
    const [feedbackData, setFeedbackData] = useState({
        score: 0,
        max_score: 0,
        summary_bullets: [],
        detailed_feedback: []
    });

    const [ocr, setOcr] = useState()

    // send feedback data as a str in the body
    const updateData = async () => {
        const token = getToken();
        const submission_id = state?.id;
        const formData = new URLSearchParams({
            feedback: JSON.stringify(feedbackData),
        });
        try {
            const response = await axios.post(`${API_URL}/review_feedback`,formData, {
                params: {
                    submission_id: submission_id,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            console.log("Response data:", response.data);
        } catch (error) {
            console.error("Error updating feedback:", error);
        }
       console.log("feedback here",feedbackData);
    };
    

    const [expandedItems, setExpandedItems] = useState([]);

    const token = getToken();
    const { state } = useLocation();
    const submission_id = state?.id;



    useEffect(() => {
        const getOcr = async () => {
            try {
                const response = await axios.get(`${API_URL}/assignment/submission_ocr`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    params: {
                        submission_id: submission_id,
                    }
                });
                console.log("ocr :", response.data);
                setOcr(response.data.ocr_text)
                // setFeedbackData(response.data);
            } catch (error) {
                console.error("Error fetching feedback:", error);
            }
        };
        getOcr();
    }, [submission_id]);


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
                console.log("Response data:", response.data);
                setFeedbackData(response.data);
            } catch (error) {
                console.error("Error fetching feedback:", error);
            }
        };
        getResult();
    }, [submission_id]);

    const toggleExpand = (questionId) => {
        setExpandedItems(prev => 
            prev.includes(questionId) 
                ? prev.filter(id => id !== questionId) 
                : [...prev, questionId]
        );
    };

    const updateQuestionField = (questionId, field, value) => {
        setFeedbackData(prev => ({
            ...prev,
            detailed_feedback: prev.detailed_feedback.map(item => 
                item.question_id === questionId 
                    ? { ...item, [field]: value } 
                    : item
            )
        }));
    };

    const updateGradingAnalysis = (questionId, index, field, value) => {
        setFeedbackData(prev => ({
            ...prev,
            detailed_feedback: prev.detailed_feedback.map(item => {
                if (item.question_id === questionId) {
                    const updatedAnalysis = [...item.grading_analysis];
                    updatedAnalysis[index] = { ...updatedAnalysis[index], [field]: value };
                    return { ...item, grading_analysis: updatedAnalysis };
                }
                return item;
            })
        }));
    };

    const updateArrayField = (questionId, field, index, value) => {
        setFeedbackData(prev => ({
            ...prev,
            detailed_feedback: prev.detailed_feedback.map(item => {
                if (item.question_id === questionId) {
                    const updatedArray = [...item[field]];
                    updatedArray[index] = value;
                    return { ...item, [field]: updatedArray };
                }
                return item;
            })
        }));
    };

    const updateSummaryBullet = (index, value) => {
        setFeedbackData(prev => {
            const updatedBullets = [...prev.summary_bullets];
            updatedBullets[index] = value;
            return { ...prev, summary_bullets: updatedBullets };
        });
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

            <div className="absolute top-[14vh] h-[82vh] flex overflow-auto space-y-6 hide-scrollbar w-full px-4">

                <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-[36rem] h-[48rem] overflow-auto hide-scrollbar mr-8">
                    <h2 className='text-2xl font-bold'>OCR</h2>
                    <Markdown>
                        {ocr}
                    </Markdown>
                </div>

                <div className='w-[84rem]'>

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
                                    <textarea 
                                        value={item.feedback} 
                                        onChange={(e) => updateQuestionField(item.question_id, 'feedback', e.target.value)}
                                        className="w-full text-[#8591ad] p-2 border border-gray-200 rounded hide-scrollbar"
                                        onClick={(e) => e.stopPropagation()}
                                        rows={3}
                                        onFocus={(e) => e.currentTarget.setSelectionRange(
                                            e.currentTarget.value.length,
                                            e.currentTarget.value.length
                                        )}
                                    />
                                </div>

                                {item.grading_analysis?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-[#545e79] mb-3">Grading Analysis</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {item.grading_analysis.map((analysis, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-50 p-4 rounded shadow-sm"
                                            >
                                            <input
                                                type="text"
                                                value={analysis.category}
                                                onChange={(e) => updateGradingAnalysis(item.question_id, index, 'category', e.target.value)}
                                                className="font-medium text-[#8591ad] bg-transparent border-none w-full"
                                                onClick={(e) => e.stopPropagation()}
                                                onFocus={(e) => e.currentTarget.setSelectionRange(
                                                    e.currentTarget.value.length,
                                                    e.currentTarget.value.length
                                                )}
                                            />
                                            <input
                                                type="text"
                                                value={analysis.score}
                                                onChange={(e) => updateGradingAnalysis(item.question_id, index, 'score', e.target.value)}
                                                className="text-green-400 font-bold bg-transparent border-none"
                                                onClick={(e) => e.stopPropagation()}
                                                onFocus={(e) => e.currentTarget.setSelectionRange(
                                                    e.currentTarget.value.length,
                                                    e.currentTarget.value.length
                                                )}
                                            />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                )}

                                {item.strengths?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-[#545e79] mb-2">Strengths</h4>
                                    <div className="space-y-2">
                                        {item.strengths.map((strength, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={strength}
                                            onChange={(e) => updateArrayField(item.question_id, 'strengths', index, e.target.value)}
                                            className="w-full text-[#8591ad] p-2 border border-gray-200 rounded"
                                            onClick={(e) => e.stopPropagation()}
                                            onFocus={(e) => e.currentTarget.setSelectionRange(
                                                e.currentTarget.value.length,
                                                e.currentTarget.value.length
                                            )}
                                        />
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
                                                <input
                                                    key={index}
                                                    type="text"
                                                    value={area}
                                                    onChange={(e) => updateArrayField(item.question_id, 'areas_of_improvement', index, e.target.value)}
                                                    className="w-full text-[#8591ad] p-2 border border-gray-200 rounded"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onFocus={(e) => e.currentTarget.setSelectionRange(
                                                        e.currentTarget.value.length,
                                                        e.currentTarget.value.length
                                                    )}
                                                />
                                            ))}
                                            </>
                                        ) : (
                                        <textarea
                                            value={item.areas_of_improvement}
                                            onChange={(e) => updateQuestionField(item.question_id, 'areas_of_improvement', e.target.value)}
                                            className="w-full text-[#8591ad] p-2 border border-gray-200 rounded"
                                            rows={2}
                                            onClick={(e) => e.stopPropagation()}
                                            onFocus={(e) => e.currentTarget.setSelectionRange(
                                                e.currentTarget.value.length,
                                                e.currentTarget.value.length
                                            )}
                                        />
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
                                <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => updateSummaryBullet(index, e.target.value)}
                                    className="w-full text-[#8591ad] p-1 border border-gray-200 rounded"
                                    onFocus={(e) => e.currentTarget.setSelectionRange(
                                        e.currentTarget.value.length,
                                        e.currentTarget.value.length
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                </div>

            </div>
            <div 
            onClick={updateData}
            className="absolute bottom-4 right-12 w-[8rem] h-[6vh] flex items-center justify-center bg-[#545e79] rounded-lg shadow-md cursor-pointer text-2xl">
                save
            </div>
        </div>
    );
}