import './App.css';
import Terminal from "./components/terminal.tsx";
import { useEffect, useState } from 'react';
import FileTree from "./components/tree.tsx"
import socket from './socket.ts';

function App() {
  const [fileTree, setFileTree] = useState({})
  const getFileTree = async() => {
    try {
      const response = await fetch('http://localhost:8000/files')
      console.log("response is: ", response);
      
      const result = await response.json();
      console.log("Result is: ", result);
      
      setFileTree(result)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getFileTree()
  },[])

  useEffect(() => {
    socket.on("file:refresh", getFileTree)

    return () => {
      socket.off("file:refresh", getFileTree)
    }
  },[])
  return (
    <div className="playground_Container h-screen flex flex-col">
      {/* Editor takes the remaining available space */}
      <div className="editor_container flex flex-row flex-grow bg-gray-200">
        <div className="file-container ">
          <FileTree tree={fileTree}/>
        </div>
        <div className="code-editor"></div>
      </div>

      {/* Terminal container only takes as much space as needed */}
      <div className="terminal_container flex-none bg-gray-900">
        <Terminal />
      </div>
    </div>
  );
}

export default App;
