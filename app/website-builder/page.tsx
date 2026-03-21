"use client";

import { useState } from "react";

export default function WebsiteBuilder() {
const [generatedHTML, setGeneratedHTML] = useState("");
async function handleGenerate() {
  const res = await fetch("/api/website-builder", {
    method: "POST",
  });

  const data = await res.json();

  setGeneratedHTML(data.result); // 🔥 THIS updates preview
}

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <button onClick={handleGenerate}>
  Generate Website
</button>
      <iframe
        srcDoc={generatedHTML}
        title="Preview"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: "#fff"
        }}
      />
    </div>
  );
}