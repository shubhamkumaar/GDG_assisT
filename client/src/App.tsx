import './App.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
// import SideBar from './components/SideBar'
import WorkingPage from './components/WorkingPage'
import Layout from './Layout'
import ClassRoomPage from './components/ClassRoomPage'
import AssignmentPage from './components/AssignmentPage'
import AssignmentFeedback from './components/AssignmentFeedback'
import LoginPage from './components/Login'
import SignUpPage from './components/SignUp'



function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignUpPage />} />
      <Route path='' element={<Layout />}>
        <Route path='' element={<WorkingPage />} />
        <Route path='classroom' element={<ClassRoomPage />} />
        <Route path='classroom/assignment' element={<AssignmentPage />} />
        <Route path='classroom/assignment/result-feedback' element={<AssignmentFeedback />} />

      </Route>
      </>
    )
  )

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
