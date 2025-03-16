

export default function SideBar() {

    // const [isSelected, setIsSelected] = useState("Home");

  return (
    <>
        <div className="flex flex-col h-[100vh]">
            <div className='bg-[#AAB2C6] w-[22rem] h-[5rem]'>
                <div  className='flex flex-row items-center justify-between h-[5rem]'>
                    <div className='flex flex-row items-center justify-start h-[5rem] ml-[1.5rem]'>
                        <div className='w-8 h-8 rounded-full bg-amber-50' ></div>
                        <div className='text-4xl font-bold text-[#545E79] cursor-pointer ml-[0.8rem]'>Solver</div>
                    </div>
                    <img className='h-8 w-8 mr-[1rem] cursor-pointer'
                        src="/CloseSymbol.svg" alt="Close" />
                </div>
            </div>
            <div className='bg-[#CED3DF] w-[22rem] h-[100vh]'>
                <div className='flex flex-col items-center justify-start h-[42rem] '>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-10 ml-[8rem] w-full '>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="HomeSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Home</div>
                    </div>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[8rem] w-full'>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="ClassSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Class</div>
                    </div>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[8rem] w-full'>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="ResultSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Result</div>
                    </div>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[8rem] w-full'>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="TodoSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Todo</div>
                    </div>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[8rem] w-full'>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="FeedbackSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Feedback</div>
                    </div>
                    <div className='flex flex-row items-center justify-start h-[4rem] mt-2 ml-[8rem] w-full'>
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="ProfileSymbol.svg" alt="logo" />
                        <div className='text-3xl font-semibold text-[#545E79] cursor-pointer'>Profile</div>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}