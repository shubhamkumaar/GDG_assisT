import { useState } from 'react'


export default function ClassBox() {

  const [notification, setNotification] = useState(false);
  return (
    <>
    <div className='bg-[#8591ad] w-[30rem] h-[28rem] rounded-2xl mt-12 ml-16'>
      <div className='flex flex-row items-center justify-between'>
        <div className="flex flex-col justify-between p-4">
          <div className="text-3xl font-semibold text-[#F2F4F8] cursor-pointer ml-6" >Name</div>
          <div className="text-xl font-light text-[#F2F4F8] cursor-pointer ml-10" >class no. </div>
          <div className="text-2xl font-medium text-[#F2F4F8] cursor-pointer ml-6" >Teacher</div>
        </div>
        <div className="flex flex-row justify-center p-4">
          { notification ?
              <img className='h-8 w-8 mx-2 cursor-pointer'
                src="/NoNotify.svg" alt="No-Notification" />
              : <img className='h-8 w-8 mx-2 cursor-pointer'
                src="/YesNotify.svg" alt="yes-Notification" />
          }
          <img className='h-8 w-8 mx-2 cursor-pointer'
            src="ThreeDot.svg" alt="ThreeDot" />
        </div>
      </div>

      <hr className="h-px mt-2 bg-[#AAB2C6] border-0" />

      <div className='flex flex-col items-start justify-start ml-6 mt-2 h-[13rem]'>
        <li className='text-2xl font-semibold text-[#F2F4F8] cursor-pointer mt-2'>
          to for class
        </li>
        <li className='text-2xl font-semibold text-[#F2F4F8] cursor-pointer mt-2'>
          to for class
        </li>
        <li className='text-2xl font-semibold text-[#F2F4F8] cursor-pointer mt-2'>
          to for class
        </li>
      </div>

      <hr className="h-px mt-2 bg-[#AAB2C6] border-0" />

      <div className='flex flex-row items-center justify-end mt-6 mr-4'>
        <img className='h-8 w-8 mx-2 cursor-pointer mr-4'
          src="Collection.svg" alt="Collection" />
        <img className='h-8 w-8 mx-2 cursor-pointer mr-4'
          src="OtherPage.svg" alt="OtherPage" />
      </div>

    </div>
    </>
  )
}