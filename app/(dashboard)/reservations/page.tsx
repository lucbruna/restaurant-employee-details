"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReservationModal } from "@/components/pos/reservation-modal";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { format, isToday } from "date-fns";
import {
  Calendar,
  Clock,
  Loader2,
  Phone,
  Plus,
  RefreshCw,
  User,
  Users,
} from "lucide-react";

type ReservationRecord = {
  id: string;
  guestName: string;
  guestPhone: string;
  paxCount: number;
  reservationDate: string;
  reservationTime: string;
  status: string;
  notes?: string | null;
  tableId?: string | null;
  tableName?: string | null;
  createdAt?: string | null;
};

const ACTIVE_RESERVATION_STATUSES = new Set(["pending", "confirmed", "seated"]);

function getStatusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "border-transparent bg-tertiary/15 text-tertiary";
    case "seated":
      return "border-transparent bg-primary/12 text-primary";
    case "cancelled":
      return "border-transparent bg-destructive/12 text-destructive";
    case "no_show":
      return "border-transparent bg-warning/12 text-warning";
    default:
      return "border-transparent bg-secondary/10 text-secondary";
  }
}

function formatStatusLabel(status: string) {
  return status.replace("_", " ");
}

function formatReservationDate(dateValue: string) {
  const parsed = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return isToday(parsed) ? "Today" : format(parsed, "dd MMM yyyy");
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const loadReservations = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);

    try {
      const response = await apiClient.get("/reservations");
      setReservations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setLoadError(
        getApiErrorMessage(
          error,
          "O workspace de reservas não pôde carregar os dados de reservas ao vivo.",
        ),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const confirmedCount = useMemo(
    () =>
      reservations.filter(
        (reservation) =>
          reservation.status === "confirmed" || reservation.status === "seated",
      ).length,
    [reservations],
  );

  const pendingCount = useMemo(
    () =>
      reservations.filter((reservation) => reservation.status === "pending").length,
    [reservations],
  );

  const totalCovers = useMemo(
    () =>
      reservations
        .filter((reservation) =>
          ACTIVE_RESERVATION_STATUSES.has(reservation.status),
        )
        .reduce(
          (sum, reservation) => sum + Number(reservation.paxCount ?? 0),
          0,
        ),
    [reservations],
  );

  if (isLoading) {
    return (
      <div className="min-h-full bg-background p-6 md:p-8">
        <Card className="border-border/70 bg-card/95">
          <CardContent className="flex items-center gap-3 p-6 text-sm font-semibold text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Carregando reservas ao vivo…
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-6 md:p-8">
      <div className="mb-8">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-primary/14 via-card to-accent/16 shadow-[var(--shadow-elevation-2)]">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                Livro de Convidados Bhukkad
              </div>
              <div className="space-y-2">
                <h1 className="brand-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Reservas
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                  Acompanhe as reservas de hoje, confirme covers rapidamente e mantenha a equipe
                  de salão alinhada.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => void loadReservations()}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Atualizar
              </Button>
              <Button onClick={() => setShowReservationModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Reserva
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {loadError ? (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-destructive">
                Sincronização de reservas precisa de atenção
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => void loadReservations()}
              disabled={isRefreshing}
            >
              Tentar sincronização
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard label="Reservas confirmadas" value={confirmedCount.toString()} />
        <SummaryCard label="Pendente" value={pendingCount.toString()} />
        <SummaryCard label="Covers esperados" value={totalCovers.toString()} />
      </div>

      <div className="grid gap-4">
        {reservations.length === 0 ? (
          <Card className="border-border/70 bg-card/95">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Nenhuma reserva ainda
                </h2>
                <p className="text-sm text-muted-foreground">
                  Novas reservas aparecerão aqui assim que a equipe de recepção as adicionar.
                </p>
              </div>
              <Button onClick={() => setShowReservationModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar a primeira reserva
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {reservations.map((reservation) => (
          <Card key={reservation.id} className="border-border/70 bg-card/95">
            <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-medium)] bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {reservation.guestName}
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground">
                      {reservation.tableName
                        ? `Atribuído à mesa ${reservation.tableName}.`
                        : "Aguardando atribuição de mesa pela equipe de recepção."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-primary" />
                      {reservation.guestPhone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      {reservation.reservationTime}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary" />
                      {reservation.paxCount} covers
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatReservationDate(reservation.reservationDate)}
                    </div>
                  </div>
                  {reservation.notes ? (
                    <p className="text-sm text-muted-foreground">{reservation.notes}</p>
                  ) : null}
                </div>
              </div>
              <Badge className={getStatusClasses(reservation.status)}>
                {formatStatusLabel(reservation.status)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        onSuccess={() => void loadReservations()}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        <h2 className="mt-3 brand-display text-3xl font-semibold text-foreground">{value}</h2>
      </CardContent>
    </Card>
  );
}
