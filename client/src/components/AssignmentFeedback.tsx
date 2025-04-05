import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { isSidebarState } from '../features/isSidebar/isSidebarSlice';
import FeedbackCard from './FeedbackCard';

export default function AssignmentFeedback() {

    const feedbackData = [
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
        },
        {
          questionId: "Q3",
          rubricScore: "10/10",
          finalScore: "10/10",
          feedback: "Your answer demonstrates a strong understanding of Herzberg's Two-Factor Theory and its practical application in addressing employee morale issues...",
          gradingAnalysis: [
            { category: "Theory Explanation", score: "2/2" },
            { category: "Strategy 1 Recommendation & Link to Theory & Recognition/Career Path", score: "3/3" },
            { category: "Strategy 2 Recommendation & Link to Theory & Recognition/Career Path", score: "3/3" },
            { category: "Overall Clarity & Problem Addressing", score: "2/2" }
          ],
          strengths: [
            "Herzberg's Two-Factor Theory provides a useful framework...",
            "Strategy 1: Implement a Structured Recognition Program (Addresses Lack of Recognition)...",
            "Strategy 2: Develop Clear Career Ladders and Development Plans (Addresses Unclear Career Growth Paths)..."
          ],
          areasOfImprovement: "While your answer is exceptionally strong, to push for even deeper analysis in future responses, consider briefly exploring potential challenges or nuances in implementing these strategies..."
        }
    ];

    const dispatch = useDispatch();

  return (
    <div  className="relative flex flex-col items-center bg-[#F2F4F8] w-full h-screen">

            <div className='absolute top-0 bg-[#ced3df] w-full h-[10vh]'>
                <div  className='flex flex-row items-center justify-between h-[10vh]'>
                    <Link
                    onClick={() => dispatch(isSidebarState(false))}
                        to="..">
                        <img className='h-8 w-8 ml-[1.5rem] cursor-pointer'
                            src="/Goback.svg" alt="Goback" />
                    </Link>
                    <div className="flex flex-row z-10  " >
                        <div className='text-xl font-semibold text-[#545E79] cursor-pointer'>Subject Name</div>
                    </div>
                    <div></div>

                </div>
            </div>

           <div className="absolute top-[14vh] h-[82vh] w-[150vh] overflow-auto space-y-6 hide-scrollbar">
            {feedbackData.map((data, index) => (
                <FeedbackCard
                    key={index}
                    questionId={data.questionId}
                    rubricScore={data.rubricScore}
                    finalScore={data.finalScore}
                    feedback={data.feedback}
                    gradingAnalysis={data.gradingAnalysis}
                    strengths={data.strengths}
                    areasOfImprovement={data.areasOfImprovement}
                />
            ))}
      </div>
    </div>
  )
}
