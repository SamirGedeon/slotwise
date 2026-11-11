import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, Plus, ShieldCheck, Users } from "lucide-react";
import { api, money } from "./api";
import type { Professional, Service, User } from "./types";
import { Avatar, Empty, ErrorBox, Loading, Modal } from "./components";
export default function Catalog({
  kind,
  user,
}: {
  kind: "services" | "professionals";
  user: User;
}) {
  const isService = kind === "services";
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const data = useQuery({
    queryKey: [kind],
    queryFn: () => api<(Service & Professional)[]>(kind),
  });
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {isService
              ? "O QUE VOCÊ FAZ DE MELHOR"
              : "PESSOAS QUE FAZEM ACONTECER"}
          </span>
          <h1>
            {isService ? "Seus serviços" : "Sua equipe"}
            <span className="heading-dot">.</span>
          </h1>
          <p>
            {isService
              ? "Uma experiência bem definida começa por um bom serviço."
              : "Cada talento, um lugar na sua agenda."}
          </p>
        </div>
        {user.role === "owner" && (
          <button className="button" onClick={() => setOpen(true)}>
            <Plus size={18} />
            {isService ? "Novo serviço" : "Novo profissional"}
          </button>
        )}
      </div>
      <div className="catalog-intro">
        <ShieldCheck size={18} />
        <p>
          {isService
            ? "Duração e valor são aplicados automaticamente a cada novo agendamento."
            : "Os agendamentos de cada profissional são protegidos contra sobreposição."}
        </p>
      </div>
      <ErrorBox error={data.error} />
      {data.isPending ? (
        <Loading />
      ) : data.isError ? (
        <button
          className="button secondary"
          onClick={() => void data.refetch()}
        >
          Tentar novamente
        </button>
      ) : !data.data.length ? (
        <Empty
          title={
            isService
              ? "Seu primeiro serviço começa aqui"
              : "Vamos conhecer sua equipe?"
          }
          text="Use o botão acima para preparar seu espaço de trabalho."
        />
      ) : (
        <div className="catalog-grid">
          {data.data.map((item, i) => (
            <article className="catalog-card" key={item.id}>
              {isService ? (
                <span className="catalog-icon">
                  <Clock3 size={24} />
                </span>
              ) : (
                <Avatar name={item.name} index={i} />
              )}
              <span className="catalog-type">
                {isService ? "SERVIÇO" : "PROFISSIONAL"}
              </span>
              <h2>{item.name}</h2>
              {isService ? (
                <>
                  <p>{item.duration_minutes} minutos por atendimento</p>
                  <div className="catalog-bottom">
                    <strong>{money(item.price_cents)}</strong>
                    <span>por sessão</span>
                  </div>
                </>
              ) : (
                <>
                  <p>{item.specialty || "Profissional do espaço"}</p>
                  <div className="catalog-bottom">
                    <Users size={17} />
                    <span>Parte da sua equipe</span>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
      {user.role === "staff" && (
        <p className="form-hint">
          Somente o proprietário pode cadastrar serviços e profissionais.
        </p>
      )}
      {open && (
        <CatalogForm
          key={kind}
          isService={isService}
          close={() => setOpen(false)}
          saved={() => {
            void client.invalidateQueries({ queryKey: [kind] });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
function CatalogForm({
  isService,
  close,
  saved,
}: {
  isService: boolean;
  close: () => void;
  saved: () => void;
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("150.00");
  const [specialty, setSpecialty] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      api(isService ? "services" : "professionals", {
        method: "POST",
        body: JSON.stringify(
          isService
            ? {
                service: {
                  name,
                  duration_minutes: Number(duration),
                  price_cents: Math.round(Number(price) * 100),
                },
              }
            : { professional: { name, specialty } },
        ),
      }),
    onSuccess: saved,
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }
  return (
    <Modal
      title={isService ? "Novo serviço" : "Novo profissional"}
      subtitle="Os detalhes certos para uma rotina mais simples."
      close={close}
    >
      <form onSubmit={submit} className="stack-form">
        <label>
          Nome
          <input
            autoFocus
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {isService ? (
          <div className="form-grid">
            <label>
              Duração (minutos)
              <input
                type="number"
                min="15"
                max="240"
                step="1"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </label>
            <label>
              Valor (R$)
              <input
                type="number"
                min="0"
                max="1000000"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
          </div>
        ) : (
          <label>
            Especialidade
            <input
              maxLength={100}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </label>
        )}
        <ErrorBox error={mutation.error} />
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close}>
            Voltar
          </button>
          <button className="button" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando…" : "Salvar cadastro"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
