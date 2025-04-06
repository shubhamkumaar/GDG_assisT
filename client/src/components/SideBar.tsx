import { AppDispatch, RootState } from '../store/store';
import { useDispatch, useSelector } from 'react-redux'
import { getPageName } from '../features/workingPage/workingPageSlice'
import { isJoiningClass } from '../features/joinPage/joinPageSlice'
import { isSidebarState } from '../features/isSidebar/isSidebarSlice'
import { logoutUser } from '../store/auth/authSlice'
import { Link } from "react-router-dom";

export default function SideBar() {

    const isSidebar = useSelector((state: RootState) => state.isSidebarPage.isSidebar)
    const isJoining = useSelector((state: RootState) => state.joinPage.isJoining)
    const isTeacher = useSelector((state: RootState) => state.auth.user?.is_teacher)
    

    
    const dispatch = useDispatch<AppDispatch>()


  return (
    <>
    {!isSidebar ? 
        <div className="flex flex-col h-[100vh]">

            <div className='bg-[#AAB2C6] w-[22rem] h-[10vh]'>
                <div  className='flex flex-row items-center justify-between h-[5rem]'>
                    <div className='flex flex-row items-center justify-start h-[5rem] ml-[1.5rem]'>
                        {/* <div className='w-8 h-8 rounded-full bg-amber-50' ></div> */}
                        {/* <div className='text-4xl font-bold text-[#545E79] cursor-pointer ml-[0.8rem]'>assisT</div> */}
                    <img className="w-[60%] my-auto" src="/image-removebg-preview.png" alt="" />
                    </div>
                    {/* <img className='h-8 w-8 mr-[1rem] cursor-pointer'
                        src="../..//CloseSymbol.svg" alt="Close" /> */}
                </div>
            </div>

            <div className='bg-[#CED3DF] w-[22rem] h-[90vh]'>

                <div className='relative flex flex-col items-center justify-start h-[100%] '>

                    <Link  to="" className='flex flex-row items-center justify-start h-[4rem] mt-10 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                    onClick={() => dispatch(getPageName("Home"))}>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="../../HomeSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Home</div>
                    </Link>

                    <Link  to="" className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                        onClick={() => dispatch(getPageName("Result"))}>
                        <img
                        className='h-8 w-8 mx-4 cursor-pointer'
                            src="../../ResultSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Result</div>
                    </Link>

                    <Link  to="" className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                        onClick={() => dispatch(getPageName("Todo"))}>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="../../TodoSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Todo</div>
                    </Link>

                    <Link  to="" className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                        onClick={() =>dispatch(getPageName("Feedback"))}>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="../../FeedbackSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Feedback</div>
                    </Link>

                    <Link  to="" className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                        onClick={() => dispatch(getPageName("Profile"))}>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="../../ProfileSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Profile</div>
                    </Link>

                    {isTeacher ? <div className='flex items-center justify-center mt-[4rem] bg-[#545e79] w-[18rem] h-[5rem] rounded-4xl cursor-pointer hover:scale-[1.02] transform transition-all duration-200 active:scale-95' 
                    onClick={() => dispatch(isJoiningClass(!isJoining))}>
                            <img className='h-6 w-6 cursor-pointer mr-4'
                                src="../../JoinClass.svg" alt="logo" />
                            <div className='text-2xl font-semibold text-[#F2F4F8] '>Create Class</div>
                        </div>
                    : <div className='flex items-center justify-center mt-[4rem] bg-[#545e79] w-[18rem] h-[5rem] rounded-4xl cursor-pointer hover:scale-[1.02] transform transition-all duration-200 active:scale-95'
                        onClick={() => dispatch(isJoiningClass(!isJoining))}>
                        <img className='h-6 w-6 cursor-pointer mr-4'
                            src="../../JoinClass.svg" alt="logo" />
                        <div className='text-2xl font-semibold text-[#F2F4F8] '>Join Class</div>
                    </div>}

                    {/* Logout button at the flex-end */}
                    <div className='flex items-center justify-center mt-[4rem] bg-[#545e79] w-[18rem] h-[5rem] rounded-4xl cursor-pointer hover:scale-[1.02] transform transition-all duration-200 active:scale-95 absolute bottom-8'
                        onClick={() => dispatch(logoutUser())}>
                        <img className='h-6 w-6 cursor-pointer mr-4'
                            src="../../LogoutSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#F2F4F8]'>Logout</div>
                    </div> 

                </div>
            </div>

        </div>
        :
        <div className="flex flex-col h-[100vh]">

            <div className='bg-[#AAB2C6] w-[6rem] h-[10vh]'>
                <div  className='flex flex-row items-center justify-between h-[10vh]'>
                    <div className='flex flex-row items-center justify-start h-[5rem] ml-[1.5rem]'>
                        <div className='w-8 h-8 rounded-full bg-amber-50' ></div>
                    </div>
                </div>
            </div>

            <div className='bg-[#CED3DF] w-[6rem] h-[100vh]'>

                <div className='flex flex-col items-center justify-start h-[42rem] '>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-10 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'>
                        <img onClick={() => 
                            {dispatch(isSidebarState(false))
                                dispatch(getPageName("Home"))}}
                        className='h-8 w-8 cursor-pointer'
                            src="../../HomeSymbol.svg" alt="logo" />
                    </div>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'>
                        <img onClick={() => 
                            {dispatch(isSidebarState(false))
                                dispatch(getPageName("Result"))}}
                        className='h-8 w-8 cursor-pointer'
                            src="../../ResultSymbol.svg" alt="logo" />
                    </div>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'>
                        <img 
                            onClick={() => {dispatch(isSidebarState(false))
                            dispatch(getPageName("Todo"))}}
                            className='h-8 w-8 cursor-pointer'
                            src="../../TodoSymbol.svg" alt="logo" />
                    </div>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'>
                        <img onClick={() => {dispatch(isSidebarState(false))
                            dispatch(getPageName("Feedback"))}}
                        className='h-8 w-8 cursor-pointer'
                            src="../../FeedbackSymbol.svg" alt="logo" />
                    </div>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[4rem] w-full hover:scale-[1.02] transform transition-all duration-200'>
                        <img onClick={() => {dispatch(isSidebarState(false))
                            dispatch(getPageName("Profile"))}}
                        className='h-8 w-8 cursor-pointer'
                            src="../../ProfileSymbol.svg" alt="logo" />
                    </div>

                </div>
            </div>

        </div>}
    </>
  )
}