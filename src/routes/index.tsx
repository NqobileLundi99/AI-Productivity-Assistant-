import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "@/components/Chat";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pilot — AI Assistant for Small Business" },
      { name: "description", content: "Write emails, summarize notes, plan tasks, and run quick research with an AI assistant built for small business owners." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Chat />
      <Toaster />
    </>
  );
}
