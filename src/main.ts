import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Failed to find #app element');
}

app.innerHTML = `
  <h1>Hello Vite + TypeScript!</h1>
  <a href="https://vitejs.dev" target="_blank">Vite Docs</a>
`;
