// homepage redirect fix
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/onboarding");
}