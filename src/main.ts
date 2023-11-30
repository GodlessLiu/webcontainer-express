import './style.css'
import './webContainer1'
import 'xterm/css/xterm.css';

document.querySelector('#app')!.innerHTML = `
  <div class="container">
    <div class="editor">
      <textarea>I am a textarea</textarea>
    </div>
    <div class="preview">
      <iframe src="src/pages/loading.html"></iframe>
    </div>
  </div>
  <div class="terminal"></div>
`;

export const iframeEl = document.querySelector('iframe');

export const textareaEl = document.querySelector('textarea');
export const terminalEl = document.querySelector('.terminal');