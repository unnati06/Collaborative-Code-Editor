import CodeEditor from "./components/Editor"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Editorpage from "./pages/EditorPage";
import Editor from './components/Editor';

function App() {
  

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}> </Route>
      <Route path="/room/:roomId" element={<Editorpage />}></Route>
      <Route path="/roomy" element={<Editor />}></Route>
    </Routes>
  </BrowserRouter>
  )
}

export default App
