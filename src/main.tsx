
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { ContentProvider } from "./app/contentStore.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <ContentProvider>
      <App />
    </ContentProvider>,
  );
  
