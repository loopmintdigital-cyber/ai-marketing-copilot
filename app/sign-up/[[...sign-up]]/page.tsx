import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <SignUp appearance={{ baseTheme: dark, variables: { colorPrimary: "#9333ea", colorBackground: "#0a0a0a", colorText: "white" } }} />
    </div>
  );
}
