"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Mail, Phone, DollarSign, Calendar } from "lucide-react"

interface Worker {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  hourly_rate: number
  start_date: string
  created_at: string
}

export default function WorkerList() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/workers")

      if (!response.ok) {
        throw new Error("Failed to fetch workers")
      }

      const data = await response.json()
      setWorkers(data.workers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkers()

    // Listen for worker-added event to refresh the list
    const handleWorkerAdded = () => {
      fetchWorkers()
    }

    window.addEventListener("worker-added", handleWorkerAdded)
    return () => window.removeEventListener("worker-added", handleWorkerAdded)
  }, [])

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      chef: "bg-primary text-primary-foreground",
      "sous-chef": "bg-primary/80 text-primary-foreground",
      "line-cook": "bg-secondary text-secondary-foreground",
      server: "bg-accent text-accent-foreground",
      host: "bg-accent/80 text-accent-foreground",
      bartender: "bg-muted text-muted-foreground",
      dishwasher: "bg-muted/80 text-muted-foreground",
      manager: "bg-primary text-primary-foreground",
    }
    return colors[position] || "bg-secondary text-secondary-foreground"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Current Staff ({workers.length})
        </CardTitle>
        <CardDescription>View all restaurant workers in the database</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No workers yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your first restaurant worker using the form on the left.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {worker.first_name} {worker.last_name}
                      </h3>
                      <Badge className={getPositionColor(worker.position)}>{worker.position}</Badge>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{worker.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{worker.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>${worker.hourly_rate}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Started {new Date(worker.start_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
