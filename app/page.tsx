import HomePage from "@/components/HomePage";
import RecaptchaButton from "@/components/RecaptchaButton";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col  justify-between p-12">
      <HomePage />
      <RecaptchaButton />
    </main>
  );
}
