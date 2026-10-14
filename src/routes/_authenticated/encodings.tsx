import { createFileRoute } from "@tanstack/react-router";
import { BirthList } from "@/components/birth-list";

export const Route = createFileRoute("/_authenticated/encodings")({
  head: () => ({ meta: [{ title: "All My Encodings — eCRIS" }] }),
  component: () => <BirthList title="All My Encodings" eyebrow="Records you have encoded" mineOnly />,
});
