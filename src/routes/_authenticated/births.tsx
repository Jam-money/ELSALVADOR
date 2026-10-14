import { createFileRoute } from "@tanstack/react-router";
import { BirthList } from "@/components/birth-list";

export const Route = createFileRoute("/_authenticated/births")({
  head: () => ({
    meta: [
      { title: "Birth Records — eCRIS" },
      { name: "description", content: "Encode, search, and validate certificates of live birth." },
      { property: "og:title", content: "Birth Records — eCRIS" },
      { property: "og:description", content: "Encode, search, and validate certificates of live birth." },
    ],
  }),
  component: () => <BirthList title="Birth Records" eyebrow="Registry - Certificate of Live Birth" />,
});
