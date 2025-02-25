import ChatInterface from "@/components/ChatInterface";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div>
      <ThemeToggle />
      <ChatInterface />
    </div>
  );
}
