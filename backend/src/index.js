import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieparser from 'cookie-parser'
import http from 'http'
import { Server as SocketServer} from 'socket.io'
import fs from 'fs/promises'
import pty from 'node-pty'
import stripAnsi from 'strip-ansi'
import path from 'path'
import chokidar from 'chokidar'

let lastOutput = '';

const ptyProcess = pty.spawn('bash', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD  + '/user',
  env: process.env
});

const app = express();
const server = http.createServer(app);
const io = new SocketServer({cors: '*'})
io.attach(server)

chokidar.watch('./user').on('all', (event, path) => {
  console.log("Path is: ",path);
  
  io.emit("file:refresh", path)
});


dotenv.config({ path: './.env' })
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}))
app.use(express.json())
app.use(cookieparser())

const port = process.env.PORT || 8800

let outputBuffer = '';
let timeoutId = null;

ptyProcess.onData(data => {
  const cleanData = stripAnsi(data);
  
  // Add to buffer
  outputBuffer += cleanData;
  io.emit("terminal:data", data)
  outputBuffer = ''
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  // Send initial prompt
  //ptyProcess.write('\r');
  
  socket.on('terminal:write', (data) => {
    console.log("Listening to terminal:write event ", data);
    ptyProcess.write(data);
  });

  socket.on('terminal:resize', ({ cols, rows }) => {
    ptyProcess.resize(cols, rows);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

app.get("/", (req, res) => {
  console.log("Hello World");
  res.send("Hello World")
});

app.get("/files", async(req,res) => {
  const files = await generateFileTree("./user")
  return res.json(files)
} )

async function generateFileTree(directory) {
  const tree = {}
  console.log("hello");
  
  async function buildTree(currentDir, currentTree) {
    const files = await fs.readdir(currentDir)
    console.log("Files are: ", files);
    console.log("currentdir and currenttree are: ", currentDir, currentTree);
    for(const file of files) {
      console.log("Directory and File before joining path are: ", currentDir, file);
      const filepath = path.join(currentDir, file)
      console.log("After joining path: ", filepath)
      const stat = await fs.stat(filepath)
      //console.log("The stat is: ", stat);
      if(stat.isDirectory()) {
        console.log(currentTree[file]);
        currentTree[file] = {}
        console.log(currentTree[file]);
        await buildTree(filepath, currentTree[file])
      } else {
        console.log("From else block file is: ", file);
        currentTree[file] = null
      }
    }
  }

  await buildTree(directory, tree)
  return tree;
}


// const tree =await generateFileTree("./user")
// console.log(tree);
// const result = await fs.readdir("./user")
// console.log("Result is: ", result);


