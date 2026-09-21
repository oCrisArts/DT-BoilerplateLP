import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./app/Layout.tsx";
import App from "./app/App.tsx";
import Success from "./app/Success.tsx";
import Cancel from "./app/Cancel.tsx";
import Privacy from "./app/Privacy.tsx";
import Terms from "./app/Terms.tsx";
import Contact from "./app/Contact.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<App />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
    </Routes>
  </BrowserRouter>
);