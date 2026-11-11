import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Plus,
  Search,
  X,
  CircleDollarSign,
} from "lucide-react";
import { api, money } from "./api";
import type { Booking, Professional, Service, Status, User } from "./types";
import { Avatar, Empty, ErrorBox, Loading, Modal } from "./components";
const statusLabels: Record<Status, string> = {
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};
export default function Schedule({ user }: { user: User }) {
  const client = useQueryClient();
  const today = DateTime.now().setZone(user.time_zone).startOf("day");
  const [date, setDate] = useState(today.toISODate()!);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [professional, setProfessional] = useState("all");
  const [modal, setModal] = useState(false);
  const [cancel, setCancel] = useState<Booking | null>(null);
  const bookings = useQuery({
    queryKey: ["bookings", date],
    queryFn: () => api<Booking[]>(`bookings?date=${date}`),
  });
  const professionals = useQuery({
    queryKey: ["professionals"],
    queryFn: () => api<Professional[]>("professionals"),
  });
  const services = useQuery({
    queryKey: ["services"],
    queryFn: () => api<Service[]>("services"),
  });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) =>
      api<Booking>(`bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ booking: { status } }),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["bookings"] });
      setCancel(null);
    },
  });
  const rows = bookings.data || [];
  const active = rows.filter((b) => b.status !== "cancelled");
  const filtered = rows.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (professional === "all" || String(b.professional_id) === professional) &&
      `${b.customer_name} ${b.customer_email} ${b.service_name}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  const selected = DateTime.fromISO(date, { zone: user.time_zone });
  const shift = (days: number) => setDate(selected.plus({ days }).toISODate()!);
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    selected.startOf("week").plus({ days: i }),
  );
  const next = active.find(
    (b) =>
      b.status === "confirmed" &&
      DateTime.fromISO(b.starts_at).toMillis() > Date.now(),
  );
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">UM DIA BEM PLANEJADO COMEÇA AQUI</div>
          <h1>
            Sua agenda<span className="heading-dot">.</span>
          </h1>
          <p>Um olhar sobre seus atendimentos e o que vem a seguir.</p>
        </div>
        <button className="button" onClick={() => setModal(true)}>
          <Plus size={18} />
          Novo agendamento
        </button>
      </div>
      <section className="stats" aria-label="Resumo do dia">
        <Stat
          label="Agendamentos"
          value={String(rows.length).padStart(2, "0")}
          detail="na data selecionada"
          icon={<CalendarDays size={20} />}
          color="green"
        />
        <Stat
          label="Confirmados"
          value={String(
            rows.filter((b) => b.status === "confirmed").length,
          ).padStart(2, "0")}
          detail="com horário reservado"
          icon={<Clock3 size={20} />}
          color="sand"
        />
        <Stat
          label="Concluídos"
          value={String(
            rows.filter((b) => b.status === "completed").length,
          ).padStart(2, "0")}
          detail="atendimentos finalizados"
          icon={<CheckCheck size={20} />}
          color="blue"
        />
        <Stat
          label="Valor previsto"
          value={money(active.reduce((n, b) => n + b.price_cents, 0))}
          detail="excluindo cancelamentos"
          icon={<CircleDollarSign size={20} />}
          color="purple"
        />
      </section>
      <div className="agenda-layout">
        <section className="agenda-panel">
          <div className="section-top">
            <div>
              <h2>
                Seus atendimentos{" "}
                <span className="count-pill">{rows.length}</span>
              </h2>
              <p>Todos os detalhes, sem perder o ritmo.</p>
            </div>
            <button
              className="text-button"
              onClick={() => setDate(today.toISODate()!)}
            >
              Hoje
              <ArrowDownRight size={15} />
            </button>
          </div>
          <div className="calendar-toolbar">
            <div className="date-group">
              <button
                className="icon-button"
                aria-label="Dia anterior"
                onClick={() => shift(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <label className="date-label">
                <CalendarDays size={16} />
                <input
                  aria-label="Data da agenda"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    if (e.target.value) setDate(e.target.value);
                  }}
                />
              </label>
              <button
                className="icon-button"
                aria-label="Próximo dia"
                onClick={() => shift(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <span className="date-caption">
              {selected.setLocale("pt-BR").toFormat("cccc")}
            </span>
          </div>
          <div className="week-strip">
            {weekdays.map((day) => (
              <button
                key={day.toISODate()}
                className={day.toISODate() === date ? "day selected" : "day"}
                onClick={() => setDate(day.toISODate()!)}
                aria-label={day.setLocale("pt-BR").toFormat("cccc, dd/MM")}
                aria-pressed={day.toISODate() === date}
              >
                <span>
                  {day.setLocale("pt-BR").toFormat("ccc").replace(".", "")}
                </span>
                <strong>{day.toFormat("dd")}</strong>
                <i className={day.hasSame(today, "day") ? "today-mark" : ""} />
              </button>
            ))}
          </div>
          <div className="filters">
            <label className="search-input">
              <Search size={16} />
              <input
                placeholder="Buscar cliente ou serviço…"
                aria-label="Buscar cliente ou serviço"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="filter-select">
              <Filter size={15} />
              <select
                aria-label="Filtrar por status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">Todos os status</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <select
              className="professional-filter"
              aria-label="Filtrar por profissional"
              value={professional}
              onChange={(e) => setProfessional(e.target.value)}
            >
              <option value="all">Toda a equipe</option>
              {professionals.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <ErrorBox
            error={
              bookings.error ||
              professionals.error ||
              services.error ||
              mutation.error
            }
          />
          {bookings.isPending ? (
            <Loading />
          ) : bookings.isError ? (
            <div className="retry-wrap">
              <button
                className="button secondary"
                onClick={() => void bookings.refetch()}
              >
                Tentar novamente
              </button>
            </div>
          ) : !filtered.length ? (
            <Empty
              title={
                rows.length
                  ? "Nenhum resultado encontrado"
                  : "Um dia cheio de possibilidades"
              }
              text={
                rows.length
                  ? "Ajuste a busca ou os filtros para ver seus atendimentos."
                  : "Ainda não há atendimentos nesta data. Que tal agendar o primeiro?"
              }
            />
          ) : (
            <div className="booking-list">
              <div className="table-head">
                <span>HORÁRIO</span>
                <span>CLIENTE E SERVIÇO</span>
                <span>PROFISSIONAL</span>
                <span>STATUS</span>
                <span />
              </div>
              {filtered.map((b, i) => (
                <article
                  className={`booking-row ${b.status === "cancelled" ? "is-cancelled" : ""}`}
                  key={b.id}
                >
                  <div className="time-cell">
                    <strong>
                      {DateTime.fromISO(b.starts_at)
                        .setZone(user.time_zone)
                        .toFormat("HH:mm")}
                    </strong>
                    <small>
                      {
                        DateTime.fromISO(b.ends_at).diff(
                          DateTime.fromISO(b.starts_at),
                          "minutes",
                        ).minutes
                      }{" "}
                      min
                    </small>
                  </div>
                  <div className="client-cell">
                    <Avatar name={b.customer_name} index={i} />
                    <div>
                      <strong>{b.customer_name}</strong>
                      <small>{b.service_name}</small>
                    </div>
                  </div>
                  <div className="professional-cell">
                    <span
                      className={`tiny-dot color-${b.professional_id % 4}`}
                    />
                    {b.professional_name}
                  </div>
                  <span className={`status status-${b.status}`}>
                    <i />
                    {statusLabels[b.status]}
                  </span>
                  <div className="row-actions">
                    {b.status === "confirmed" && (
                      <>
                        {DateTime.fromISO(b.ends_at).toMillis() <=
                          Date.now() && (
                          <button
                            className="icon-button"
                            disabled={mutation.isPending}
                            aria-label={`Concluir atendimento de ${b.customer_name}`}
                            onClick={() =>
                              mutation.mutate({ id: b.id, status: "completed" })
                            }
                          >
                            <CheckCheck size={16} />
                          </button>
                        )}
                        <button
                          className="icon-button cancel-action"
                          aria-label={`Cancelar atendimento de ${b.customer_name}`}
                          onClick={() => {
                            mutation.reset();
                            setCancel(b);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="list-footer">
            <span>
              {filtered.length}{" "}
              {filtered.length === 1 ? "atendimento" : "atendimentos"}
            </span>
            <span>Horários de {user.time_zone.replace("_", " ")}</span>
          </div>
        </section>
        <aside className="day-sidebar">
          <section className="next-card">
            <span className="eyebrow">
              {next ? "PRÓXIMO NA DATA" : "RESPIRE. ESTÁ TUDO EM DIA."}
            </span>
            <div className="next-icon">
              <Clock3 size={24} />
            </div>
            {next ? (
              <>
                <h3>
                  {DateTime.fromISO(next.starts_at)
                    .setZone(user.time_zone)
                    .toFormat("HH:mm")}
                  <span>
                    {" "}
                    —{" "}
                    {DateTime.fromISO(next.ends_at)
                      .setZone(user.time_zone)
                      .toFormat("HH:mm")}
                  </span>
                </h3>
                <strong>{next.customer_name}</strong>
                <p>{next.service_name}</p>
                <div className="next-professional">
                  <Avatar name={next.professional_name} />
                  <span>{next.professional_name}</span>
                </div>
              </>
            ) : (
              <>
                <h3>Seu próximo passo</h3>
                <p>Organize novos atendimentos e mantenha a rotina leve.</p>
                <button className="text-button" onClick={() => setModal(true)}>
                  Criar agendamento
                  <ArrowUpRight size={16} />
                </button>
              </>
            )}
          </section>
          <section className="team-card">
            <div className="mini-heading">
              <h3>Equipe do espaço</h3>
              <span>{professionals.data?.length || 0}</span>
            </div>
            {professionals.data?.map((p, i) => (
              <div className="team-member" key={p.id}>
                <Avatar name={p.name} index={i} />
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.specialty || "Profissional"}</small>
                </div>
                <span className="member-indicator" />
              </div>
            ))}
            {!professionals.data?.length && (
              <p>Cadastre profissionais na aba Equipe.</p>
            )}
            <div className="team-note">
              <span className="tiny-dot" />
              Agenda compartilhada pela equipe
            </div>
          </section>
          <div className="quiet-note">
            <Sparkle />
            <p>
              Pequenos planos.
              <br />
              <strong>Grandes dias.</strong>
            </p>
          </div>
        </aside>
      </div>
      {modal && (
        <BookingForm
          user={user}
          date={date}
          services={services.data || []}
          professionals={professionals.data || []}
          close={() => setModal(false)}
        />
      )}
      {cancel && (
        <Modal
          title="Cancelar atendimento?"
          subtitle={`O horário de ${cancel.customer_name} ficará disponível para outra reserva.`}
          close={() => setCancel(null)}
        >
          <ErrorBox error={mutation.error} />
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setCancel(null)}
            >
              Voltar
            </button>
            <button
              className="button danger"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ id: cancel.id, status: "cancelled" })
              }
            >
              {mutation.isPending ? "Cancelando…" : "Confirmar cancelamento"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Stat({
  label,
  value,
  detail,
  icon,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {label}
        <span className={`stat-icon ${color}`}>{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
function Sparkle() {
  return <span className="decorative-sparkle">✳</span>;
}
function BookingForm({
  user,
  date,
  services,
  professionals,
  close,
}: {
  user: User;
  date: string;
  services: Service[];
  professionals: Professional[];
  close: () => void;
}) {
  const client = useQueryClient();
  const [localDate, setLocalDate] = useState(date);
  const [time, setTime] = useState("09:00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [service, setService] = useState(String(services[0]?.id || ""));
  const [professional, setProfessional] = useState(
    String(professionals[0]?.id || ""),
  );
  const chosen = services.find((s) => String(s.id) === service);
  const mutation = useMutation({
    mutationFn: () =>
      api("bookings", {
        method: "POST",
        body: JSON.stringify({
          booking: {
            customer_name: name,
            customer_email: email,
            service_id: service,
            professional_id: professional,
            starts_at: DateTime.fromISO(`${localDate}T${time}`, {
              zone: user.time_zone,
            })
              .toUTC()
              .toISO(),
            notes,
          },
        }),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["bookings"] });
      close();
    },
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }
  return (
    <Modal
      title="Novo agendamento"
      subtitle="Um novo encontro, com tudo no lugar."
      close={close}
    >
      {!services.length || !professionals.length ? (
        <Empty
          title="Prepare seu espaço primeiro"
          text="Cadastre pelo menos um serviço e um profissional nas abas Serviços e Equipe."
        />
      ) : (
        <form onSubmit={submit} className="stack-form">
          <label>
            Nome do cliente
            <input
              autoFocus
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome e sobrenome"
            />
          </label>
          <label>
            E-mail do cliente
            <input
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@exemplo.com"
            />
          </label>
          <label>
            Serviço
            <select
              aria-label="Serviço"
              required
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.duration_minutes} min · {money(s.price_cents)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Profissional
            <select
              aria-label="Profissional"
              required
              value={professional}
              onChange={(e) => setProfessional(e.target.value)}
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              Data
              <input
                required
                type="date"
                min={DateTime.now().setZone(user.time_zone).toISODate()!}
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
              />
            </label>
            <label>
              Horário
              <input
                required
                type="time"
                min="08:00"
                max="17:45"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>
          <p className="form-hint">
            Atendimentos entre 08h e 18h · {user.time_zone}. Duração:{" "}
            {chosen?.duration_minutes} minutos.
          </p>
          <label>
            Observações <span className="optional">opcional</span>
            <textarea
              maxLength={2000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Algum detalhe para o atendimento?"
            />
          </label>
          <ErrorBox error={mutation.error} />
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={close}>
              Voltar
            </button>
            <button className="button" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando…" : "Confirmar agendamento"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
