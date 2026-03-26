import type { Route } from "./+types/home"
import Footer from "~/components/Footer"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WBSP-rs" },
    { name: "description", content: "A WASM based plugin service." },
  ]
}

export default function Home() {
  return (
    <div className="min-h-svh">
      <div>A new way to host logic.</div>
      <Footer />
    </div>
  )
}
