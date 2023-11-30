/** 
 * Demo 2
 * 添加交互性
 */ 
import { WebContainer } from '@webcontainer/api';
import { files } from './resource/files';
import { iframeEl, terminalEl, textareaEl } from './main';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
let webcontainerInstance :WebContainer;
let terminal:Terminal;

window.addEventListener("load",async ()=>{
     textareaEl!.value = files['index.js'].file.contents;
    // Call only once
    webcontainerInstance = await WebContainer.boot();
    const fitAddon = new FitAddon();
    terminal = new Terminal({
        convertEol: true,
    });
    terminal.loadAddon(fitAddon);
    terminal.open(terminalEl!);
    fitAddon.fit();
    await webcontainerInstance.mount(files);
    webcontainerInstance.on('server-ready', (_, url) => {
        iframeEl!.src = url;
    });
    const shellProcess = await startShell(terminal);
    window.addEventListener("resize",()=>{
        fitAddon.fit();
        shellProcess.resize({
            cols: terminal.cols,
            rows: terminal.rows,
        });
    })
})



async function startShell(terminal:Terminal){
    const shellProcess =  await webcontainerInstance.spawn('bash',{
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
  });
    shellProcess.output.pipeTo(new WritableStream({
        write(data){
            terminal.write(data);
        }
    }))
    const writer = shellProcess.input.getWriter();
    terminal.onData((data)=>{
        writer.write(data);
    })
    return shellProcess;
}