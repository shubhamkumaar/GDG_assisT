import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { getClassroomType } from '../features//classroomPage/classroomPageSlice';

import { Link } from 'react-router-dom';
import Announcement from './Announcement';
import Assignment from './Assignment';
import Student from './Student';


export default function ClassRoomPage() {

    const classroomPage = useSelector((state: RootState) => state.classroomPage.classroomType)
    const dispatch = useDispatch();

    return (
        <div  className=" flex flex-col  bg-[#F2F4F8] w-full h-screen">
            <div className='bg-[#ced3df] w-full h-[5rem]'>
                <div  className='flex flex-row items-center justify-between h-[5rem]'>
                    <Link onClick={() => dispatch(getClassroomType("Announcement"))}
                        to="/">
                        <img className='h-8 w-8 ml-[1.5rem] cursor-pointer'
                            src="/Goback.svg" alt="Goback" />
                    </Link>
                    <div className="flex flex-row z-10  " >
                        <div
                            className='flex flex-row items-center justify-start h-[4rem] ml-[2rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                             onClick={() => dispatch(getClassroomType("Announcement"))}>
                            <img className='h-8 w-8 mx-4 cursor-pointer'
                             src="StudentGroup.svg" alt="StudentGroup" />
                            <div className='text-xl font-semibold text-[#545E79] cursor-pointer'>Announcement</div>
                        </div>

                        <div
                            className='flex flex-row items-center justify-start h-[4rem] ml-[2rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                            onClick={() => dispatch(getClassroomType("Assignment"))}>
                            <img className='h-8 w-8 mx-4 cursor-pointer'
                             src="StudentGroup.svg" alt="StudentGroup" />
                            <div className='text-xl font-semibold text-[#545E79] cursor-pointer'>Assignment</div>
                        </div>

                        <div
                            className='flex flex-row items-center justify-start h-[4rem] ml-[2rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                            onClick={() => dispatch(getClassroomType("Students"))}>
                            <img className='h-8 w-8 mx-4 cursor-pointer'
                             src="StudentGroup.svg" alt="StudentGroup" />
                            <div className='text-xl font-semibold text-[#545E79] cursor-pointer'>Students</div>
                        </div>

                    </div>

                    <div className="flex flex-row">
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="TodoSymbol.svg" alt="TodoSymbol" />
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="FeedbackSymbol.svg" alt="FeedbackSymbol" />
                    </div>

                </div>
            </div>

            <div className='bg-[#F2F4F8] w-full h-screen'>
                {(() => {
                switch (classroomPage) {
                    case 'Announcement':
                    return <Announcement />;
                    case 'Assignment':
                    return <Assignment />;
                    case 'Students':
                    return <Student />;;
                }
                })()}
                  </div>
        </div>
    )
}