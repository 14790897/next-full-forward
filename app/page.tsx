import HomePage from "@/components/HomePage";
import RecaptchaButton from "@/components/RecaptchaButton";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <HomePage />
      <RecaptchaButton />
    </main>
  );
}
