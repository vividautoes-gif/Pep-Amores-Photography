window.addEventListener('error', (e) => {
  document.body.innerHTML += `<div style="color:red; padding:20px; z-index:9999; position:absolute; top:0; left:0; background:white;">${e.message}<br/><pre>${e.error?.stack}</pre></div>`;
});
