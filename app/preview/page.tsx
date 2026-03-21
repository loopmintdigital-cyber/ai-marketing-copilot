"use client";
import { useEffect } from "react";

export default function Preview() {
  useEffect(() => {
    const html = localStorage.getItem("previewHTML");
    if (html) {
      document.open();
      document.write(html);
      document.close();
    }
  }, []);

  return null;
}
