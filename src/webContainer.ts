import { WebContainer } from '@webcontainer/api';
import { files } from './resource/files';
import { iframeEl, terminalEl, textareaEl } from './main';
import {Terminal} from 'xterm'

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance :WebContainer;
let terminal:Terminal;
window.addEventListener('load', async () => {
  textareaEl!.value = files['index.js'].file.contents;
  // Call only once
  webcontainerInstance = await WebContainer.boot();
  terminal = new Terminal({
    convertEol: true,
  });

  terminal.open(terminalEl as HTMLElement);

  (await webcontainerInstance.spawn('ls',['-al'])).output.pipeTo(new WritableStream({
    write(data){
      console.log(data);
    }
  }))
  await webcontainerInstance.mount(files)
  const exitCode  = await installDependencies();
  if(exitCode != 0) return;
  await startServer();


  textareaEl!.addEventListener("input",(el:any)=>{
    writeIndexJS(el.currentTarget!.value);
  })
  startShell(terminal);
});


async function writeIndexJS(content:string) {
  await webcontainerInstance.fs.writeFile('/index.js', content);
};


async function installDependencies() {
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  installProcess.output.pipeTo(new WritableStream({
    write(data) {
      terminal.write(data);
    }
  }));
  return installProcess.exit;
}


async function startServer(){
  const startProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);
  webcontainerInstance.on('server-ready', (port, url) => {
      iframeEl!.src = url;
  });
  startProcess.output.pipeTo(new WritableStream({
    write(data) {
      terminal.write(data);
    }
  }));
}

async function startShell(terminal:Terminal) {
  const shellProcess = await webcontainerInstance.spawn('bash');
  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    })
  );
  const input = shellProcess.input.getWriter();
  terminal.onData((data) => {
    input.write(data);
  });
  return shellProcess;
};