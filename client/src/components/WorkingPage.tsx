import ClassBox from "./ClassBox";
import JoinClass from "./JoinClass";

export default function WorkingPage() {

    return (
      <>
      <div className='bg-[#F2F4F8] w-full h-screen'>

        <div className='flex flex-row flex-wrap items-Start justify-start overflow-y-auto h-full pb-12'>
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
          <ClassBox />
        </div>

        <div className="">
          <JoinClass />
        </div>

      </div>
      </>
    )
  }