import './App.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
// import SideBar from './components/SideBar'
import WorkingPage from './components/WorkingPage'
import Layout from './Layout'
import ClassRoomPage from './components/ClassRoomPage'
import AssignmentPage from './components/AssignmentPage'
import AssignmentFeedback from './components/AssignmentFeedback'





function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='' element={<Layout />}>
        <Route path='' element={<WorkingPage />} />
        <Route path='classroom' element={<ClassRoomPage />} />
        <Route path='classroom/assignment' element={<AssignmentPage />} />
        <Route path='classroom/assignment/result-feedback' element={<AssignmentFeedback />} />

      </Route>
    )
  )

  return (
    <>
      <RouterProvider router={router} />
        {/* <SideBar />
        <WorkingPage /> */}
    </>
  )
}

export default App
