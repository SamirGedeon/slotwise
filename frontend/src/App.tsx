import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  HelpCircle,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { api, getToken, setToken } from "./api";
import type { User } from "./types";
import { Avatar, ErrorBox, Loading, Logo } from "./components";
import Schedule from "./Schedule";
import Catalog from "./Catalog";
export default function App() {
  const client = useQueryClient();
  const [token, updateToken] = useState(getToken);
  const [help, setHelp] = useState(false);
  const user = useQuery({
    queryKey: ["session", token],
    queryFn: () => api<{ user: User }>("session"),
    enabled: !!token,
    retry: false,
  });
  const clearSession = () => {
    setToken(null);
    updateToken(null);
    client.clear();
  };
  useEffect(() => {
    const clear = () => {
      setToken(null);
      updateToken(null);
      client.clear();
    };
    window.addEventListener("session-expired", clear);
    return () => window.removeEventListener("session-expired", clear);
  }, [client]);
  const logout = useMutation({
    mutationFn: () => api("session", { method: "DELETE" }),
    onSuccess: clearSession,
  });
  if (!token)
    return (
      <Login
        onLogin={(t) => {
          setToken(t);
          updateToken(t);
        }}
      />
    );
  if (user.isPending) return <Loading />;
  if (!user.data)
    return (
      <main className="login-fallback">
        <ErrorBox error={user.error} />
        <button className="button" onClick={() => void user.refetch()}>
          Tentar novamente
        </button>
        <button className="button secondary" onClick={clearSession}>
          Voltar ao login
        </button>
      </main>
    );
  const me = user.data.user;
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Logo />
        <div className="workspace">
          <span className="workspace-icon">SA</span>
          <div>
            <strong>{me.account_name}</strong>
            <small>Seu espaço de trabalho</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <p className="nav-label">ESPAÇO DE TRABALHO</p>
        <nav aria-label="Navegação principal">
          <NavLink to="/agenda">
            <CalendarDays size={19} />
            Agenda <span className="nav-live" />
          </NavLink>
          <NavLink to="/services">
            <LayoutGrid size={19} />
            Serviços
          </NavLink>
          <NavLink to="/team">
            <Users size={19} />
            Equipe
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <span className="tip-icon">
              <Sparkles size={19} />
            </span>
            <h3>Mais tempo para o que importa.</h3>
            <p>Sua rotina organizada, um agendamento de cada vez.</p>
            <span className="tip-line" />
          </div>
          <button className="help-button" onClick={() => setHelp(!help)}>
            <HelpCircle size={18} />
            Como funciona
          </button>
          {help && (
            <div className="help-copy">
              Cadastre serviços e profissionais. Na agenda, escolha uma data e
              crie um atendimento. Horários: 08h às 18h, no fuso da empresa. O
              sistema impede conflitos.
            </div>
          )}
          <div className="profile">
            <Avatar name={me.name} />
            <div>
              <strong>{me.name}</strong>
              <small>{me.role === "owner" ? "Proprietário" : "Equipe"}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Sair"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogOut size={18} />
            </button>
          </div>
          <ErrorBox error={logout.error} />
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <span>
            <span className="breadcrumb-brand">Workspace</span>
            <span className="breadcrumb-slash">/</span>
            {me.account_name}
          </span>
          <span className="workspace-status">
            <span />
            Tudo organizado por aqui
          </span>
        </header>
        <Routes>
          <Route path="/agenda" element={<Schedule user={me} />} />
          <Route
            path="/services"
            element={<Catalog kind="services" user={me} />}
          />
          <Route
            path="/team"
            element={<Catalog kind="professionals" user={me} />}
          />
          <Route path="*" element={<Navigate to="/agenda" replace />} />
        </Routes>
        <footer className="footer">
          <span>Feito para simplificar seu dia.</span>
          <span>
            <ShieldCheck size={14} />
            Seu espaço. Seus dados.
          </span>
        </footer>
      </main>
    </div>
  );
}
function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useMutation({
    mutationFn: () =>
      api<{ token: string }>("session", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: (result) => onLogin(result.token),
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    login.mutate();
  }
  return (
    <div className="login-layout">
      <section className="login-story">
        <Logo />
        <div>
          <span className="eyebrow light">MENOS RUÍDO. MAIS FLUIDEZ.</span>
          <h1>
            Seu tempo merece
            <br />
            uma agenda
            <br />
            <em>mais leve.</em>
          </h1>
          <p>
            Organize os atendimentos, cuide da sua equipe e abra espaço para
            fazer o que você faz de melhor.
          </p>
          <div className="login-checks">
            <span>
              <Check size={16} />
              Sem horários sobrepostos
            </span>
            <span>
              <Check size={16} />
              Tudo em um só lugar
            </span>
          </div>
        </div>
        <span className="login-note">Uma rotina organizada começa aqui.</span>
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
      </section>
      <main className="login-form-wrap">
        <form onSubmit={submit} className="login-form">
          <span className="login-glyph">
            <CalendarDays size={28} />
          </span>
          <span className="eyebrow">BEM-VINDO AO SLOTWISE</span>
          <h2>Bom ter você por aqui.</h2>
          <p>Entre para acompanhar seus próximos atendimentos.</p>
          <label>
            E-mail
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
            />
          </label>
          <ErrorBox error={login.error} />
          <button className="button login-submit" disabled={login.isPending}>
            {login.isPending ? "Entrando…" : "Entrar no meu espaço"}
            <ArrowRight size={18} />
          </button>
          {import.meta.env.DEV && (
            <div className="demo-access">
              <strong>Explore a demonstração local</strong>
              <p>Dados fictícios. Veja os exemplos na agenda de amanhã.</p>
              <button
                type="button"
                onClick={() => {
                  setEmail("owner@slotwise.test");
                  setPassword("Slotwise-demo-2026!");
                }}
              >
                Preencher acesso de demonstração <ArrowRight size={14} />
              </button>
            </div>
          )}
          <small className="login-security">
            <Clock3 size={14} />
            Sessão segura com duração de 12 horas
          </small>
        </form>
      </main>
    </div>
  );
}
