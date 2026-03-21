"use client";

import { useState } from "react";

export default function WebsiteBuilder() {
  const [generatedHTML, setGeneratedHTML] = useState(`
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <h1 style="font-size:40px;">🔥 It Works!</h1>
</body>
</html>
`);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
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