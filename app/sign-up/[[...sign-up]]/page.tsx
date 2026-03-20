import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)"
    }}>
      <SignUp appearance={{ 
        baseTheme: dark, 
        variables: { 
          colorPrimary: "#9333ea", 
          colorBackground: "#1a0533",
          colorInputBackground: "#2d1054",
          colorText: "white",
          colorTextSecondary: "#c084fc",
          borderRadius: "12px"
        } 
      }} />
    </div>
  );
}
