import type { Route } from "./+types/dashboard";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "wbps | Dashboard" },
    {
      name: "description",
      content: "The wbps Dashboard",
    },
  ];
}

export default function Dashboard() {
  return (
    <main className="py-12">
      <p className="my-72 text-center text-3xl">Work In Progress!</p>
    </main>
  );
}
