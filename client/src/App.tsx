import './App.css'
import SideBar from './components/SideBar'
import WorkingPage from './components/WorkingPage'



function App() {


  return (
    <>
      <div className='flex flex-row'>
        <SideBar />
        <WorkingPage />
      </div>
    </>
  )
}

export default App
