import WorkerForm from "@/components/worker-form"
import WorkerList from "@/components/worker-list"
import { UtensilsCrossed } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-balance">Restaurant Staff Manager</h1>
              <p className="text-sm text-muted-foreground">Manage your team efficiently</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <WorkerForm />
          <WorkerList />
        </div>
      </main>
    </div>
  )
}
