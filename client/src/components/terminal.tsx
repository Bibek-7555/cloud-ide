import React, { useEffect, useRef, useState } from 'react'
import { Terminal as ClientTerminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css'
import socket from '../socket.ts';


function Terminal(): JSX.Element {

    const termRef = useRef<HTMLDivElement>(null)
    const isRendered = useRef(false)
    const terminalInstance = useRef<ClientTerminal | null>(null);

    useEffect(() => {
        if (isRendered.current) {
            return
        }
        isRendered.current = true;
        const term = new ClientTerminal({
            rows: 20,
            //cols: 100,
        });
        //terminalInstance.current = term;
        if (termRef.current) {
            term.open(termRef.current)
        }
        term.onData((data) => {
            socket.emit("terminal:write", data)
        })

        function onTerminalData(data:any) {
            term.write(data)
        }

        socket.on("terminal:data", onTerminalData);
        term.onResize((size) => {
            socket.emit("terminal:resize", { cols: size.cols, rows: size.rows });
        });

    }, [])
    return (
        <div ref={termRef} >
        </div>
    );
}

export default Terminal;

