import { Link,useLocation } from 'react-router-dom';
import { RootState } from '../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { getfeedbackType } from '../features/feedbackType/feedbackTypeSlice';

export default function AssignmentFeedback() {

    const location = useLocation();
    const result = location.state;

  const feedbacktype = useSelector((state: RootState) => state.feedbackPage.feedbackType)
  const dispatch = useDispatch();

  return (
    <div  className=" flex flex-col  bg-[#F2F4F8] w-full h-screen">

            <div className='bg-[#ced3df] w-full h-[10vh]'>
                <div  className='flex flex-row items-center justify-between h-[10vh]'>
                    <Link
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


        <div className='flex flex-row items-center justify-center h-full'>

            <div className='flex flex-col items-center justify-center w-[24rem] h-[52rem] rounded-lg shadow-xl bg-[#eff2f7]'>

                <div className='flex items-center justify-center drop-shadow-md font-bold mt-[3rem] rounded-lg text-center text-2xl bg-[#f1f4fa] text-[#545e79] inset-shadow-sm w-[18rem] h-[8rem] transition-all duration-300 hover:bg-[#fbfcff] hover:scale-[1.02] cursor-pointer active:scale-[0.98]' 
                 onClick={() => dispatch(getfeedbackType("Strong")) }>
                    Strong
                </div>
                <div className='flex items-center justify-center drop-shadow-md font-bold mt-[3rem] rounded-lg text-center text-2xl bg-[#f1f4fa] text-[#545e79] inset-shadow-sm w-[18rem] h-[8rem] transition-all duration-300 hover:bg-[#fbfcff] hover:scale-[1.02] cursor-pointer active:scale-[0.98]' 
                 onClick={() => dispatch(getfeedbackType("Weak")) }>
                    Weak
                </div>
                <div className='flex items-center justify-center drop-shadow-md font-bold mt-[3rem] rounded-lg text-center text-2xl bg-[#f1f4fa] text-[#545e79] inset-shadow-sm w-[18rem] h-[8rem] transition-all duration-300 hover:bg-[#fbfcff] hover:scale-[1.02] cursor-pointer active:scale-[0.98]' 
                 onClick={() => dispatch(getfeedbackType("Question-wise")) }>
                    Question wise
                </div>
                <div className='flex items-center justify-center drop-shadow-md font-bold mt-[3rem] rounded-lg text-center text-2xl bg-[#f1f4fa] text-[#545e79] inset-shadow-sm w-[18rem] h-[8rem] transition-all duration-300 hover:bg-[#fbfcff] hover:scale-[1.02] cursor-pointer active:scale-[0.98]' 
                 onClick={() => dispatch(getfeedbackType("Rubric")) }>
                    Rubric
                </div>
            </div>


            <div className=' w-[68rem] h-[52rem] rounded-lg shadow-xl bg-[#eff2f7] ml-[2rem] overflow-y-scroll hide-scrollbar '>
                {(() => {
                    switch (feedbacktype) {
                        case 'Strong':
                            return <div className='flex flex-col items-center justify-center mt-[3rem]'>
                                <div className='text-2xl font-bold'>Strengths</div>
                                    <div className='text-xl mt-[1rem]'>
                                        <ul>
                                            {result.detailed_feedback.strengths.map((strengths) => (
                                                <li className='mt-[1rem]'>{strengths}</li>
                                            ))}
                                        </ul>
                                    </div>
                            </div>;
                        case 'Weak':
                            return <div className='flex flex-col items-center justify-center mt-[3rem]'>
                                <div className='text-2xl font-bold'>Areas of Improvement</div>
                                    <div className='text-xl mt-[1rem]'>
                                        <ul>
                                            {result.detailed_feedback.areas_of_improvement.map((areas_of_improvement) => (
                                                <li className='mt-[1rem]'>{areas_of_improvement}</li>
                                            ))}
                                        </ul>
                                    </div>
                            </div>;
                        case 'Question-wise':
                            return <div className='flex flex-col items-center justify-center mt-[3rem]'>
                                <div className='text-2xl font-bold'>Question wise feedback</div>
                                {result.detailed_feedback.question_details.map((question_details) => (
                                    <div className='text-xl mt-[1rem] w-[60rem] h-auto rounded-lg mb-[2rem]'>
                                        <p className='ml-[2rem] mt-2  '>{question_details.question_id}</p>
                                        <p className='ml-[2rem] mt-2  '>Score : {question_details.score}</p>
                                        <p className='ml-[2rem] mt-2  '>Skill : {question_details.rank}</p>
                                        <p className='ml-[2rem] mt-2  '>basis : {question_details.basis}</p>
                                        <p className='ml-[2rem] mt-2  '>Feedback : {question_details.feedback}</p>
                                    </div>
                                ))}
                            </div>;
                        case 'Rubric':
                            return <div className='flex flex-col items-center justify-center mt-[3rem]'>
                                <div className='text-2xl font-bold'>Rubric Summary</div>
                                <div className='text-xl mt-[1rem]'>{result.detailed_feedback.rubric_summary}</div>
                            </div>;
                    }
                })()}
            </div>
        </div>
    </div>
  )
}


// {(() => {
//     switch (feedbacktype) {
//         case 'Strong':
//         return <div>fuckoff</div>;
//         case 'Weak':
//         return <div>fuckyou</div>;
//         case 'Question-wise':
//         return <div>fuck</div>;
//         case 'Rubric':
//         return <div>ffff</div> ;
//     }
// })()}
