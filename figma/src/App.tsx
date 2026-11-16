import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
  apiRequest,
  clearApiToken,
  currentUser as fetchCurrentUser,
  getApiToken,
  login as apiLogin,
  registerStudent,
  type ApiCertificate,
  type ApiEvent,
  type ApiGuild,
  type ApiIdea,
  type ApiUser,
} from "./api";
import logo from "./assets/byte-builders-logo.png";
import mascot from "./assets/byte-mascot.png";

type Role = ApiUser["role"];
type IconName =
  | "home"
  | "users"
  | "projects"
  | "calendar"
  | "archive"
  | "target"
  | "search"
  | "bell"
  | "plus"
  | "arrow"
  | "clock"
  | "check"
  | "trend"
  | "menu"
  | "close"
  | "spark"
  | "chevron"
  | "logout"
  | "book"
  | "idea";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-6h6v6" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    projects: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M17.5 14v7M14 17.5h7" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    archive: (
      <>
        <path d="M3 6h18M5 6v15h14V6M8 3h8l2 3H6l2-3Z" />
        <path d="M9 11h6M9 15h6" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    trend: (
      <>
        <path d="m3 17 6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    spark: (
      <>
        <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" />
        <path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" />
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 9H20" />
      </>
    ),
    idea: (
      <>
        <path d="M9 18h6M10 22h4" />
        <path d="M8.2 14.5A7 7 0 1 1 15.8 14.5c-.8.6-.8 1.5-.8 2.5H9c0-1 0-1.9-.8-2.5Z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const adminNav = [
  { label: "Visão geral", icon: "home" as IconName },
  { label: "Diretoria", icon: "users" as IconName },
  { label: "Guildas", icon: "projects" as IconName },
  { label: "Minha guilda", icon: "target" as IconName },
  { label: "Aulas", icon: "book" as IconName },
  { label: "Certificados", icon: "archive" as IconName },
  { label: "Eventos", icon: "calendar" as IconName },
  { label: "Membros", icon: "target" as IconName },
  { label: "Memória", icon: "archive" as IconName },
];

adminNav.push({ label: "Ideias", icon: "idea" as IconName });
const presidentNav = [...adminNav, { label: "Criar perfil", icon: "plus" as IconName }];

const studentNav = [
  { label: "Início", icon: "home" as IconName },
  { label: "Sobre a liga", icon: "book" as IconName },
  { label: "Guildas", icon: "projects" as IconName },
  { label: "Minha guilda", icon: "target" as IconName },
  { label: "Aulas", icon: "book" as IconName },
  { label: "Certificados", icon: "archive" as IconName },
  { label: "Eventos", icon: "calendar" as IconName },
  { label: "Ideias", icon: "idea" as IconName },
];

const sectors = [
  { name: "Acadêmico", people: ["Maria Eduarda", "Raquel"], color: "#1769e8", tag: "Ensino" },
  {
    name: "Comunicação",
    people: ["Karon Tibães", "Ana Carolina", "João Vitor", "Crisiele"],
    color: "#7b5de8",
    tag: "Marca",
  },
  {
    name: "Extensão",
    people: ["Rafael Martins", "Márcio Ribeiro"],
    color: "#16a375",
    tag: "Impacto",
  },
  {
    name: "Administrativo",
    people: ["Christian Netto", "Luann Moreira"],
    color: "#e68b35",
    tag: "Gestão",
  },
  {
    name: "Pesquisa",
    people: ["Iasmyn Pereira", "Arthur Abreu"],
    color: "#e05472",
    tag: "Ciência",
  },
  { name: "Recursos Humanos", people: ["Ana Luiza"], color: "#2a9db0", tag: "Pessoas" },
];

const guilds = [
  {
    name: "Inteligência Artificial",
    short: "IA",
    icon: "01",
    members: 18,
    level: "Intermediário",
    color: "#1769e8",
  },
  {
    name: "Modelagem 3D",
    short: "3D",
    icon: "02",
    members: 12,
    level: "Iniciante",
    color: "#7b5de8",
  },
  {
    name: "Introdução à Programação Concorrente",
    short: "PC",
    icon: "03",
    members: 10,
    level: "Introdução",
    color: "#e05472",
  },
  {
    name: "Informática",
    short: "INF",
    icon: "04",
    members: 22,
    level: "Fundamentos",
    color: "#16a375",
  },
  {
    name: "Python",
    short: "PY",
    icon: "05",
    members: 26,
    level: "Todos os níveis",
    color: "#e68b35",
  },
  {
    name: "Time de Programação",
    short: "CODE",
    icon: "06",
    members: 14,
    level: "Competitivo",
    color: "#2a9db0",
  },
];

const events = [
  {
    day: "28",
    month: "JUN",
    title: "Noite de Jogos",
    category: "Integração",
    meta: "19:00 · Campus JK",
    description: "Uma noite para jogar, conversar e aproximar toda a comunidade.",
    tone: "blue",
  },
  {
    day: "05",
    month: "JUL",
    title: "Dev Weekend",
    category: "Tecnologia",
    meta: "09:00 · Lab 04",
    description: "Um fim de semana de oficinas, código e desafios em equipe.",
    tone: "violet",
  },
  {
    day: "12",
    month: "JUL",
    title: "Byte Academy",
    category: "Extensão",
    meta: "14:00 · Auditório",
    description: "Conhecimento em tecnologia compartilhado com a comunidade.",
    tone: "green",
  },
];

const lessons = [
  {
    title: "Introdução à Inteligência Artificial",
    guild: "Inteligência Artificial",
    duration: "42 min",
    teacher: "Arthur Abreu",
    watched: 100,
  },
  {
    title: "Python: primeiros passos",
    guild: "Python",
    duration: "58 min",
    teacher: "Maria Eduarda",
    watched: 64,
  },
  {
    title: "Threads, processos e concorrência",
    guild: "Programação Concorrente",
    duration: "1h 12 min",
    teacher: "Christian Netto",
    watched: 0,
  },
  {
    title: "Modelando seu primeiro objeto 3D",
    guild: "Modelagem 3D",
    duration: "47 min",
    teacher: "Raquel",
    watched: 0,
  },
];

function LoginPage({ onLogin }: { onLogin: (profile: ApiUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [audience, setAudience] = useState<"student" | "management">("student");
  const [name, setName] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedUser = user.trim().toLowerCase();
    if (mode === "register" && password.length < 8) {
      setError("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const profile =
        mode === "register"
          ? await registerStudent(name.trim(), normalizedUser, password)
          : await apiLogin(normalizedUser, password);
      const matchesAudience =
        audience === "student"
          ? profile.role === "student"
          : profile.role === "admin" || profile.role === "president";
      if (!matchesAudience) {
        clearApiToken();
        setError(
          audience === "student"
            ? "Este acesso pertence à diretoria. Selecione “Diretoria” acima."
            : "Este acesso pertence a um aluno. Selecione “Aluno” acima.",
        );
        return;
      }
      onLogin(profile);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível entrar.");
    } finally {
      setSubmitting(false);
    }
  };

  const backgroundStyle = {
    "--pointer-x": `${pointer.x}%`,
    "--pointer-y": `${pointer.y}%`,
  } as CSSProperties;

  return (
    <div
      className="login-page"
      style={backgroundStyle}
      onPointerMove={(event) =>
        setPointer({
          x: (event.clientX / window.innerWidth) * 100,
          y: (event.clientY / window.innerHeight) * 100,
        })
      }
    >
      <div className="circuit-background" aria-hidden="true">
        <span className="orb orb-one" />
        <span className="orb orb-two" />
        <span className="orb orb-three" />
        <div className="circuit-lines" />
      </div>
      <section className="login-story">
        <div className="login-brand">
          <img src={logo} alt="Byte Builders" />
          <div>
            <strong>
              Byte<span>Hub</span>
            </strong>
            <small>BYTE BUILDERS · UFVJM</small>
          </div>
        </div>
        <div className="login-copy">
          <p className="eyebrow">CONSTRUIR · CONECTAR · TRANSFORMAR</p>
          <h1>
            A liga acontece
            <br />
            quando <em>todo mundo</em>
            <br />
            entra no código.
          </h1>
          <p>
            Projetos, pessoas e oportunidades em um só lugar. A nova central digital da Byte
            Builders.
          </p>
          <div className="login-metrics">
            <div>
              <strong>6</strong>
              <span>guildas ativas</span>
            </div>
            <div>
              <strong>15</strong>
              <span>pessoas na diretoria</span>
            </div>
            <div>
              <strong>3</strong>
              <span>eventos chegando</span>
            </div>
          </div>
        </div>
        <img className="login-mascot" src={mascot} alt="Mascote da Byte Builders" />
      </section>

      <section className="login-panel">
        <form onSubmit={submit}>
          <div className="login-mobile-brand">
            <img src={logo} alt="" />
            <strong>ByteHub</strong>
          </div>
          <p className="eyebrow">{mode === "login" ? "ÁREA RESTRITA" : "NOVO PERFIL"}</p>
          <h2>{mode === "login" ? "Que bom ter você aqui." : "Comece sua jornada."}</h2>
          <p className="login-subtitle">
            {mode === "login"
              ? "Entre com seu perfil para acessar seu espaço na liga."
              : "Crie seu perfil de aluno para participar do ByteHub."}
          </p>
          {mode === "login" && (
            <div className="login-audience" aria-label="Tipo de acesso">
              <button
                type="button"
                className={audience === "student" ? "active" : ""}
                onClick={() => {
                  setAudience("student");
                  setError("");
                  setUser("");
                  setPassword("");
                }}
              >
                <Icon name="book" size={17} />
                <span>
                  <strong>Aluno</strong>
                  <small>Portal da comunidade</small>
                </span>
              </button>
              <button
                type="button"
                className={audience === "management" ? "active" : ""}
                onClick={() => {
                  setAudience("management");
                  setError("");
                  setUser("");
                  setPassword("");
                }}
              >
                <Icon name="target" size={17} />
                <span>
                  <strong>Diretoria</strong>
                  <small>Acesso administrativo</small>
                </span>
              </button>
            </div>
          )}
          {mode === "register" && (
            <label>
              Nome
              <div className="login-input">
                <Icon name="users" size={18} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como devemos chamar você?"
                  autoFocus
                  required
                />
              </div>
            </label>
          )}
          <label>
            {mode === "login" ? "E-mail ou usuário" : "E-mail"}
            <div className="login-input">
              <Icon name="book" size={18} />
              <input
                type={mode === "register" ? "email" : "text"}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
                placeholder={
                  mode === "register"
                    ? "voce@email.com"
                    : audience === "management"
                      ? "E-mail ou usuário da diretoria"
                      : "Digite seu e-mail ou usuário"
                }
                autoFocus={mode === "login"}
              />
            </div>
          </label>
          <label>
            Senha
            <div className="login-input">
              <Icon name="archive" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                minLength={mode === "register" ? 8 : 1}
                required
              />
            </div>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button className="login-submit" type="submit" disabled={submitting}>
            {submitting ? "Aguarde..." : mode === "login" ? "Entrar no ByteHub" : "Criar meu perfil"}{" "}
            <Icon name="arrow" size={18} />
          </button>
          <div className={`login-switch ${audience === "management" ? "management-only" : ""}`}>
            <span>{mode === "login" ? "Ainda não tem um perfil?" : "Já possui um perfil?"}</span>
            {audience === "student" || mode === "register" ? (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                  setName("");
                  setUser("");
                  setPassword("");
                }}
              >
                {mode === "login" ? "Criar perfil" : "Voltar para o login"}
              </button>
            ) : (
              <small>Perfis são criados pela Presidência.</small>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [active, setActive] = useState("Visão geral");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => setCurrentUser(null);
    window.addEventListener("bytehub:auth-expired", handleAuthExpired);
    if (!getApiToken()) {
      setAuthLoading(false);
      return () => window.removeEventListener("bytehub:auth-expired", handleAuthExpired);
    }
    let active = true;
    fetchCurrentUser()
      .then((profile) => {
        if (active) {
          setCurrentUser(profile);
          setActive(profile.role === "student" ? "Início" : "Visão geral");
        }
      })
      .catch(() => clearApiToken())
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => {
      active = false;
      window.removeEventListener("bytehub:auth-expired", handleAuthExpired);
    };
  }, []);

  if (authLoading) {
    return <div className="login-page"><p className="eyebrow">Conectando ao ByteHub...</p></div>;
  }

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={(profile) => {
          setCurrentUser(profile);
          setActive(profile.role === "student" ? "Início" : "Visão geral");
        }}
      />
    );
  }

  const role = currentUser.role;
  const isManagement = role === "admin" || role === "president";
  const nav = role === "student" ? studentNav : role === "president" ? presidentNav : adminNav;
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };
  const go = (page: string) => {
    setActive(page);
    setMobileOpen(false);
  };
  const logout = () => {
    clearApiToken();
    setCurrentUser(null);
    setSearch("");
    setShowNotifications(false);
  };

  return (
    <div className={`app-shell ${role === "student" ? "student-mode" : ""}`}>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <img src={logo} alt="Byte Builders" />
          </div>
          <div>
            <strong>
              Byte<span>Hub</span>
            </strong>
            <small>BYTE BUILDERS</small>
          </div>
        </div>
        <button
          className="mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        >
          <Icon name="close" />
        </button>
        <nav aria-label="Navegação principal">
          <p className="nav-caption">{isManagement ? "ESPAÇO DA DIRETORIA" : "ESPAÇO DO ALUNO"}</p>
          {nav.map((item) => (
            <button
              key={item.label}
              className={active === item.label ? "active" : ""}
              onClick={() => go(item.label)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <div className="spark">
            <Icon name="spark" size={17} />
          </div>
          <strong>{isManagement ? "Gestão em movimento" : "Seu próximo passo"}</strong>
          <p>
            {isManagement
              ? "Organize a liga hoje para deixar um legado amanhã."
              : "Escolha uma guilda e comece a construir com a gente."}
          </p>
          <button onClick={() => go(isManagement ? "Diretoria" : "Guildas")}>
            Explorar <Icon name="arrow" size={14} />
          </button>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {currentUser.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <strong>{currentUser.name}</strong>
            <small>{currentUser.area ?? (isManagement ? "Diretoria" : "Portal do aluno")}</small>
          </div>
          <button onClick={logout} aria-label="Sair">
            <Icon name="logout" size={17} />
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <main>
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Icon name="menu" />
          </button>
          <div className="search">
            <Icon name="search" size={19} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isManagement
                  ? "Buscar pessoas, guildas, eventos..."
                  : "O que você quer aprender hoje?"
              }
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <div className="notification-wrap">
              <button
                className="icon-button"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notificações"
              >
                <Icon name="bell" />
                <span />
              </button>
              {showNotifications && (
                <div className="notification-panel">
                  <div>
                    <strong>Notificações</strong>
                    <button onClick={() => setShowNotifications(false)}>
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                  <p>
                    <span className="dot blue" />
                    Inscrições do Dev Weekend abertas
                  </p>
                  <p>
                    <span className="dot orange" />
                    Guilda de Python tem novo encontro
                  </p>
                  <p>
                    <span className="dot green" />
                    Noite de Jogos confirmada
                  </p>
                </div>
              )}
            </div>
            {role === "president" ? (
              <button className="primary-button" onClick={() => go("Criar perfil")}>
                <Icon name="plus" size={18} /> Criar membro
              </button>
            ) : role === "admin" ? (
              <button
                className="primary-button"
                onClick={() => notify("Nova iniciativa adicionada ao planejamento.")}
              >
                <Icon name="plus" size={18} /> Nova iniciativa
              </button>
            ) : (
              <button className="primary-button" onClick={() => go("Ideias")}>
                <Icon name="idea" size={18} /> Enviar ideia
              </button>
            )}
          </div>
        </header>

        {isManagement && active === "Visão geral" && (
          <AdminHome
            go={go}
            notify={notify}
            firstName={currentUser.name.split(" ")[0] ?? currentUser.name}
          />
        )}
        {role === "student" && active === "Início" && <StudentHome go={go} />}
        {active === "Diretoria" && <BoardPage />}
        {active === "Guildas" && (
          <GuildsPage role={role} search={search} notify={notify} />
        )}
        {active === "Minha guilda" && <MyGuildPage notify={notify} go={go} />}
        {active === "Aulas" && <LessonsPage notify={notify} />}
        {active === "Certificados" && (
          <CertificatesPage notify={notify} />
        )}
        {active === "Eventos" && <EventsPage role={role} notify={notify} />}
        {active === "Sobre a liga" && <AboutPage go={go} />}
        {active === "Ideias" && (
          <IdeasPage role={role} userEmail={currentUser.email} notify={notify} />
        )}
        {role === "president" && active === "Criar perfil" && (
          <PresidentProfilesPage notify={notify} />
        )}
        {active === "Membros" && (
          <SimplePage
            title="Pessoas que fazem acontecer"
            eyebrow="MEMBROS"
            text="Acompanhe a jornada, as habilidades e a participação de cada integrante da Byte Builders."
            items={sectors.map((sector) => `${sector.people.length} pessoas em ${sector.name}`)}
          />
        )}
        {active === "Memória" && (
          <SimplePage
            title="Conhecimento que não se perde"
            eyebrow="MEMÓRIA INSTITUCIONAL"
            text="Atas, decisões, processos e aprendizados preservados para fortalecer as próximas gestões."
            items={[
              "Atas e decisões",
              "Guias de processos",
              "Relatórios da gestão",
              "Histórico de eventos",
            ]}
          />
        )}
      </main>

      {toast && (
        <div className="toast">
          <Icon name="check" size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function AdminHome({
  go,
  notify,
  firstName,
}: {
  go: (page: string) => void;
  notify: (message: string) => void;
  firstName: string;
}) {
  const stats = [
    {
      label: "Pessoas na diretoria",
      value: "15",
      note: "2 líderes · 6 setores",
      icon: "users" as IconName,
      tone: "blue",
    },
    {
      label: "Guildas ativas",
      value: "06",
      note: "102 participações",
      icon: "projects" as IconName,
      tone: "violet",
    },
    {
      label: "Próximos eventos",
      value: "03",
      note: "Junho e julho",
      icon: "calendar" as IconName,
      tone: "green",
    },
    {
      label: "Ideias recebidas",
      value: "14",
      note: "+5 esta semana",
      icon: "idea" as IconName,
      tone: "orange",
    },
  ];
  return (
    <div className="content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">CENTRAL DA DIRETORIA</p>
          <h1>
            Olá, {firstName}. <span>Vamos movimentar a liga?</span>
          </h1>
          <p>Uma visão clara das pessoas, projetos e próximos encontros da Byte Builders.</p>
        </div>
        <div className="management-pill">
          <span className="status-dot" /> Gestão ativa · Matheus Neri
        </div>
      </section>
      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className={`stat-icon ${stat.tone}`}>
              <Icon name={stat.icon} />
            </div>
            <div>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <small>
                <Icon name="trend" size={13} />
                {stat.note}
              </small>
            </div>
          </article>
        ))}
      </section>
      <section className="command-grid">
        <article className="leadership-card">
          <div className="moving-grid" />
          <p className="eyebrow">LIDERANÇA 2025</p>
          <h2>
            Uma diretoria feita
            <br />
            para construir junto.
          </h2>
          <div className="leaders">
            <div>
              <span>MN</span>
              <p>
                <small>PRESIDENTE</small>
                <strong>Matheus Neri</strong>
              </p>
            </div>
            <div>
              <span>AD</span>
              <p>
                <small>VICE-PRESIDENTE</small>
                <strong>Arthur Dias</strong>
              </p>
            </div>
          </div>
          <button onClick={() => go("Diretoria")}>
            Conhecer toda a diretoria <Icon name="arrow" size={16} />
          </button>
        </article>
        <article className="panel events-panel">
          <div className="panel-heading">
            <div>
              <h2>Próximos eventos</h2>
              <p>A agenda está movimentada</p>
            </div>
            <button className="round-link" onClick={() => go("Eventos")}>
              <Icon name="arrow" size={17} />
            </button>
          </div>
          {events.map((event) => (
            <button
              key={event.title}
              className="event-item"
              onClick={() => go("Eventos")}
            >
              <span className={`date-box ${event.tone}`}>
                <strong>{event.day}</strong>
                <small>{event.month}</small>
              </span>
              <span>
                <strong>{event.title}</strong>
                <small>
                  <Icon name="clock" size={13} />
                  {event.meta}
                </small>
              </span>
              <Icon name="chevron" size={16} />
            </button>
          ))}
        </article>
      </section>
      <section className="guild-strip">
        <div className="strip-copy">
          <p className="eyebrow">PROJETOS EM GUILDAS</p>
          <h2>Aprender fazendo é o nosso jeito.</h2>
          <p>Seis comunidades práticas conectando curiosidade, tecnologia e colaboração.</p>
          <button onClick={() => go("Guildas")}>
            Ver todas as guildas <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="orbit-visual" aria-hidden="true">
          <span>IA</span>
          <i>PY</i>
          <b>3D</b>
          <em>CODE</em>
          <div />
        </div>
        <img src={mascot} alt="Mascote Byte Builders" />
      </section>
    </div>
  );
}

function StudentHome({ go }: { go: (page: string) => void }) {
  const [nextEvent, setNextEvent] = useState<ApiEvent | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<ApiEvent[]>("/events")
      .then((items) => {
        if (active) setNextEvent(items[0] ?? null);
      })
      .catch(() => setNextEvent(null));
    return () => {
      active = false;
    };
  }, []);

  const nextEventDate = nextEvent ? new Date(nextEvent.startsAt) : null;
  return (
    <div className="student-content">
      <section className="student-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="student-hero-copy">
          <p className="eyebrow">BEM-VINDO AO BYTEHUB</p>
          <h1>
            Seu lugar para
            <br />
            <span>explorar, aprender</span>
            <br />e criar tecnologia.
          </h1>
          <p>
            Entre em uma guilda, participe dos eventos e ajude a imaginar os próximos projetos da
            Byte Builders.
          </p>
          <div>
            <button className="primary-button" onClick={() => go("Guildas")}>
              Explorar guildas <Icon name="arrow" size={17} />
            </button>
            <button onClick={() => go("Sobre a liga")}>Conhecer a liga</button>
          </div>
        </div>
        <div className="student-mascot">
          <span className="mascot-ring" />
          <img src={mascot} alt="Mascote Byte Builders" />
          <div className="floating-chip chip-one">
            <Icon name="spark" size={15} />
            Aprenda fazendo
          </div>
          <div className="floating-chip chip-two">
            <span />
            Comunidade ativa
          </div>
        </div>
      </section>
      <section className="student-section-heading">
        <div>
          <p className="eyebrow">ESCOLHA SEU CAMINHO</p>
          <h2>O que você quer construir?</h2>
        </div>
        <button onClick={() => go("Guildas")}>
          Ver todas <Icon name="arrow" size={16} />
        </button>
      </section>
      <section className="featured-guilds">
        {guilds.slice(0, 3).map((guild, index) => (
          <article key={guild.id} style={{ "--guild-color": guild.color } as CSSProperties}>
            <span className="guild-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="guild-symbol">{guild.short}</div>
            <p>{guild.level}</p>
            <h3>{guild.name}</h3>
            <div>
              <span>{guild.memberCount} participantes</span>
              <button onClick={() => go("Guildas")} aria-label={`Ver guilda ${guild.name}`}>
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
      <section className="next-event-card">
        <div className="event-big-date">
          <strong>{nextEventDate ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(nextEventDate) : "--"}</strong>
          <span>{nextEventDate ? new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(nextEventDate).toUpperCase() : "SEM EVENTO"}</span>
        </div>
        <div>
          <p className="eyebrow">PRÓXIMO ENCONTRO</p>
          <h2>{nextEvent?.title ?? "Nenhum evento cadastrado"}</h2>
          <p>{nextEvent?.description ?? "Confira novamente mais tarde."}</p>
          <button onClick={() => go("Eventos")}>
            Quero participar <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="pixel-decoration" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
    </div>
  );
}

function BoardPage() {
  return (
    <div className="section-page">
      <section className="board-hero">
        <div>
          <p className="eyebrow">DIRETORIA BYTE BUILDERS</p>
          <h1>
            Estratégia com pessoas
            <br />
            no centro de tudo.
          </h1>
          <p>
            Cada setor cuida de uma parte da liga. Juntos, transformamos ideias em experiências,
            projetos e impacto.
          </p>
        </div>
        <div className="board-leaders">
          <article>
            <span>MN</span>
            <small>PRESIDENTE</small>
            <h2>Matheus Neri</h2>
            <p>Direção estratégica e representação institucional</p>
          </article>
          <article>
            <span>AD</span>
            <small>VICE-PRESIDENTE</small>
            <h2>Arthur Dias</h2>
            <p>Integração dos setores e apoio à gestão</p>
          </article>
        </div>
      </section>
      <div className="section-title">
        <div>
          <p className="eyebrow">QUEM FAZ ACONTECER</p>
          <h2>Setores da liga</h2>
        </div>
        <p>2 líderes · 13 pessoas nos setores · uma só Byte Builders</p>
      </div>
      <section className="sector-grid">
        {sectors.map((sector, index) => (
          <article key={sector.name} style={{ "--sector-color": sector.color } as CSSProperties}>
            <div className="sector-top">
              <span>0{index + 1}</span>
              <em>{sector.tag}</em>
            </div>
            <h3>{sector.name}</h3>
            <div className="sector-people">
              {sector.people.map((person) => (
                <div key={person}>
                  <span>
                    {person
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <strong>{person}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function GuildsPage({
  role,
  search,
  notify,
}: {
  role: Role;
  search: string;
  notify: (message: string) => void;
}) {
  const [guildList, setGuildList] = useState<ApiGuild[]>([]);
  const [memberships, setMemberships] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<ApiGuild[]>("/guilds"),
      apiRequest<Array<{ guild: ApiGuild }>>("/me/guilds"),
    ])
      .then(([allGuilds, myMemberships]) => {
        if (!active) return;
        setGuildList(allGuilds);
        setMemberships(myMemberships.map((membership) => membership.guild.id));
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "Erro ao carregar guildas."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = guildList.filter((guild) => guild.name.toLowerCase().includes(search.toLowerCase()));

  const joinGuild = async (guildId: string, guildName: string) => {
    try {
      await apiRequest(`/guilds/${guildId}/membership`, { method: "POST" });
      setMemberships((current) => (current.includes(guildId) ? current : [...current, guildId]));
      notify(`Inscrição registrada em ${guildName}.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível entrar na guilda.");
    }
  };
  return (
    <div className="section-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">APRENDER · PRATICAR · COMPARTILHAR</p>
          <h1>Guildas Byte Builders</h1>
          <p>Pequenos times, grandes curiosidades. Escolha um tema e venha aprender construindo.</p>
        </div>
        <div className="guild-live">
          <span />
          <strong>{guilds.length} guildas ativas</strong>
          <small>Encontros semanais</small>
        </div>
      </section>
      <section className="guild-full-grid">
        {loading ? <p>Carregando guildas...</p> : visible.map((guild, index) => (
          <article key={guild.id} style={{ "--guild-color": guild.color } as CSSProperties}>
            <div className="guild-card-top">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <em>{guild.level}</em>
            </div>
            <div className="guild-logo">{guild.short}</div>
            <h2>{guild.name}</h2>
            <p>
              Conteúdo prático, trocas entre membros e desafios para transformar teoria em
              experiência.
            </p>
            <div className="guild-card-footer">
              <span>
                <Icon name="users" size={15} />
                {guild.memberCount} participantes
              </span>
              <button
                disabled={role !== "student" || memberships.includes(guild.id)}
                onClick={() => void joinGuild(guild.id, guild.name)}
              >
                {role === "student"
                  ? memberships.includes(guild.id)
                    ? "Inscrito"
                    : "Quero participar"
                  : "Somente consulta"}{" "}
                <Icon name="arrow" size={15} />
              </button>
            </div>
          </article>
        ))}
        {!loading && visible.length === 0 && <p>Nenhuma guilda encontrada para essa busca.</p>}
      </section>
    </div>
  );
}

function MyGuildPage({
  notify,
  go,
}: {
  notify: (message: string) => void;
  go: (page: string) => void;
}) {
  const [memberships, setMemberships] = useState<ApiGuild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<Array<{ guild: ApiGuild }>>("/me/guilds")
      .then((items) => {
        if (active) setMemberships(items.map((item) => item.guild));
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "Erro ao carregar suas guildas."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="section-page">
      <section className="my-guild-hero">
        <div>
          <p className="eyebrow">MEU ESPAÇO DE APRENDIZADO</p>
          <h1>
            Guildas que fazem parte
            <br />
            da sua jornada.
          </h1>
          <p>Acompanhe seus grupos, acesse o Class e encontre as aulas gravadas de cada trilha.</p>
        </div>
        <div className="guild-path">
          <span>
            <Icon name="projects" />
          </span>
          <div>
            <small>VOCÊ PARTICIPA DE</small>
            <strong>{memberships.length} guildas</strong>
          </div>
        </div>
      </section>

      <section className="membership-list">
        {loading ? <p>Carregando suas guildas...</p> : memberships.length ? (
          memberships.map((guild, index) => (
            <article key={guild.name} style={{ "--guild-color": guild.color } as CSSProperties}>
              <div className="membership-index">0{index + 1}</div>
              <div className="membership-logo">{guild.short}</div>
              <div className="membership-copy">
                <span>{guild.level}</span>
                <h2>{guild.name}</h2>
                <p>
                  Encontros semanais, materiais compartilhados e desafios práticos para evoluir em
                  grupo.
                </p>
                <div className="membership-progress">
                  <div>
                    <span style={{ width: index === 0 ? "72%" : "38%" }} />
                  </div>
                  <small>{index === 0 ? "72%" : "38%"} da trilha concluída</small>
                </div>
              </div>
              <div className="membership-actions">
                <button
                  className="class-button"
                  onClick={() => notify(`Acesso ao Class de ${guild.name} preparado.`)}
                >
                  Ir para o Class <Icon name="arrow" size={16} />
                </button>
                <button onClick={() => go("Aulas")}>
                  Ver aulas gravadas <Icon name="book" size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="certificate-empty">
            <Icon name="projects" size={30} />
            <h3>Você ainda não participa de uma guilda</h3>
            <p>Explore as guildas e registre seu interesse para começar.</p>
            <button className="primary-button" onClick={() => go("Guildas")}>Explorar guildas</button>
          </div>
        )}
      </section>

      <section className="guild-tip">
        <div>
          <Icon name="spark" />
        </div>
        <p>
          <strong>Quer participar de outra guilda?</strong>
          <span>Explore todas as trilhas disponíveis e registre seu interesse.</span>
        </p>
        <button onClick={() => go("Guildas")}>
          Explorar guildas <Icon name="arrow" size={16} />
        </button>
      </section>
    </div>
  );
}

function LessonsPage({ notify }: { notify: (message: string) => void }) {
  const [filter, setFilter] = useState("Todas");
  const filters = ["Todas", "IA", "Python", "Concorrência", "Modelagem 3D"];
  const visibleLessons =
    filter === "Todas"
      ? lessons
      : lessons.filter((lesson) =>
          filter === "IA"
            ? lesson.guild.includes("Inteligência")
            : lesson.guild.toLowerCase().includes(filter.toLowerCase()),
        );

  return (
    <div className="section-page">
      <section className="lessons-hero">
        <div>
          <p className="eyebrow">BIBLIOTECA BYTE</p>
          <h1>
            Todas as aulas.
            <br />
            <span>Sempre disponíveis.</span>
          </h1>
          <p>Reveja encontros, continue uma trilha ou descubra conteúdos de outras guildas.</p>
        </div>
        <div className="play-orbit" aria-hidden="true">
          <span>
            <Icon name="arrow" size={25} />
          </span>
          <i />
          <i />
          <i />
        </div>
      </section>

      <div className="lesson-toolbar">
        <div>
          {filters.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span>{visibleLessons.length} aulas encontradas</span>
      </div>

      <section className="lesson-grid">
        {visibleLessons.map((lesson, index) => (
          <article key={lesson.title}>
            <div className={`lesson-cover cover-${index + 1}`}>
              <span>
                {lesson.guild
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <button
                onClick={() => notify(`Reproduzindo: ${lesson.title}`)}
                aria-label={`Assistir ${lesson.title}`}
              >
                <Icon name="arrow" size={20} />
              </button>
              <small>{lesson.duration}</small>
            </div>
            <div className="lesson-copy">
              <span>{lesson.guild}</span>
              <h2>{lesson.title}</h2>
              <p>com {lesson.teacher}</p>
              <div className="lesson-progress">
                <div>
                  <span style={{ width: `${lesson.watched}%` }} />
                </div>
                <small>
                  {lesson.watched === 100
                    ? "Concluída"
                    : lesson.watched
                      ? `${lesson.watched}% assistido`
                      : "Ainda não iniciada"}
                </small>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function CertificatesPage({ notify }: { notify: (message: string) => void }) {
  const [certificates, setCertificates] = useState<ApiCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<ApiCertificate[]>("/certificates")
      .then((items) => {
        if (active) setCertificates(items);
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "Erro ao carregar certificados."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addCertificates = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files);
    try {
      const additions = await Promise.all(
        selected.map((file) =>
          apiRequest<ApiCertificate>("/certificates", {
            method: "POST",
            body: JSON.stringify({
              name: file.name,
              size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
              mimeType: file.type || undefined,
            }),
          }),
        ),
      );
      setCertificates((current) => [...additions, ...current]);
      notify(`${additions.length} metadado${additions.length > 1 ? "s registrados" : " registrado"}. O arquivo não foi enviado.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível registrar o certificado.");
    }
  };

  const removeCertificate = async (certificate: ApiCertificate) => {
    try {
      await apiRequest(`/certificates/${certificate.id}`, { method: "DELETE" });
      setCertificates((current) => current.filter((item) => item.id !== certificate.id));
      notify(`Registro de ${certificate.name} removido.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível remover o registro.");
    }
  };

  return (
    <div className="section-page">
      <section className="certificates-hero">
        <div>
          <p className="eyebrow">MINHA PASTA</p>
          <h1>
            Suas conquistas,
            <br />
            bem guardadas.
          </h1>
          <p>Organize os dados dos certificados de cursos, eventos, projetos e atividades da sua jornada.</p>
        </div>
        <div className="folder-art" aria-hidden="true">
          <span>
            <Icon name="archive" size={30} />
          </span>
          <i />
          <b />
        </div>
      </section>

      <section className="certificate-layout">
        <label className="certificate-upload">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            onChange={(event) => {
              void addCertificates(event.target.files);
              event.target.value = "";
            }}
          />
          <span>
            <Icon name="plus" size={25} />
          </span>
          <h2>Adicionar certificados</h2>
          <p>PDF, PNG ou JPG. O arquivo permanece no seu computador; apenas os metadados são registrados.</p>
          <strong>Escolher arquivos</strong>
        </label>

        <div className="certificate-folder">
          <div className="folder-heading">
            <div>
              <p className="eyebrow">ARQUIVOS SALVOS</p>
              <h2>Meus certificados</h2>
            </div>
            <span>{certificates.length}</span>
          </div>
          {loading ? <p>Carregando certificados...</p> : certificates.length ? (
            <div className="certificate-list">
              {certificates.map((certificate, index) => (
                <article key={`${certificate.name}-${index}`}>
                  <span>
                    <Icon name="archive" size={18} />
                  </span>
                  <div>
                    <strong>{certificate.name}</strong>
                    <small>
                      {certificate.size} · adicionado em {new Date(certificate.addedAt).toLocaleDateString("pt-BR")}
                    </small>
                  </div>
                  <button
                    onClick={() => void removeCertificate(certificate)}
                    aria-label={`Remover registro de ${certificate.name}`}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="certificate-empty">
              <Icon name="archive" size={30} />
              <h3>Sua pasta está vazia</h3>
              <p>Adicione seu primeiro certificado para começar.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EventsPage({
  role,
  notify,
}: {
  role: Role;
  notify: (message: string) => void;
}) {
  const [eventList, setEventList] = useState<ApiEvent[]>([]);
  const [registered, setRegistered] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<ApiEvent[]>("/events"),
      apiRequest<Array<{ event: ApiEvent }>>("/me/event-registrations"),
    ])
      .then(([allEvents, myRegistrations]) => {
        if (!active) return;
        setEventList(allEvents);
        setRegistered(myRegistrations.map((registration) => registration.event.id));
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "Erro ao carregar eventos."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const register = async (event: ApiEvent) => {
    try {
      await apiRequest(`/events/${event.id}/registrations`, { method: "POST" });
      setRegistered((current) => (current.includes(event.id) ? current : [...current, event.id]));
      notify(`Inscrição confirmada em ${event.title}.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível fazer a inscrição.");
    }
  };

  return (
    <div className="section-page">
      <section className="page-intro event-intro">
        <div>
          <p className="eyebrow">AGENDA BYTE</p>
          <h1>
            Encontros para sair
            <br />
            da tela e criar conexões.
          </h1>
          <p>Aprendizado, comunidade e boas ideias acontecem quando a gente se encontra.</p>
        </div>
        <div className="event-calendar-art">
          <span>{eventList[0] ? new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(eventList[0].startsAt)).replace(".", "").toUpperCase() : "--"}</span>
          <strong>{eventList[0] ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(new Date(eventList[0].startsAt)) : "--"}</strong>
          <i />
        </div>
      </section>
      <section className="event-cards">
        {loading ? <p>Carregando eventos...</p> : eventList.map((event, index) => {
          const date = new Date(event.startsAt);
          const month = new Intl.DateTimeFormat("pt-BR", { month: "short" })
            .format(date)
            .replace(".", "")
            .toUpperCase();
          const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date);
          const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
          return (
          <article key={event.id}>
            <div className={`event-card-date ${index % 2 ? "violet" : "blue"}`}>
              <span>{month}</span>
              <strong>{day}</strong>
            </div>
            <div className="event-card-copy">
              <span>{event.category}</span>
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <small>
                <Icon name="clock" size={15} />
                {time} · {event.location}
              </small>
            </div>
            <button
              disabled={role !== "student" || registered.includes(event.id)}
              onClick={() => void register(event)}
            >
              {role !== "student" ? "Inscrição para alunos" : registered.includes(event.id) ? "Inscrito" : "Inscrever-se"}{" "}
              <Icon name="arrow" size={16} />
            </button>
            <em>0{index + 1}</em>
          </article>
          );
        })}
        {!loading && eventList.length === 0 && <p>Nenhum evento cadastrado ainda.</p>}
      </section>
    </div>
  );
}

function AboutPage({ go }: { go: (page: string) => void }) {
  return (
    <div className="section-page">
      <section className="about-hero">
        <div>
          <p className="eyebrow">SOBRE A BYTE BUILDERS</p>
          <h1>
            Não somos apenas uma liga.
            <br />
            <span>Somos um espaço para tentar.</span>
          </h1>
          <p>
            A Byte Builders conecta estudantes que querem aprender tecnologia na prática,
            compartilhar conhecimento e construir soluções juntos dentro da UFVJM.
          </p>
          <button className="primary-button" onClick={() => go("Guildas")}>
            Encontrar minha guilda <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="about-logo">
          <img src={logo} alt="Byte Builders" />
          <span className="ring-one" />
          <span className="ring-two" />
        </div>
      </section>
      <section className="values-grid">
        {[
          [
            "01",
            "Aprender fazendo",
            "Projetos reais e desafios práticos transformam conhecimento em experiência.",
          ],
          [
            "02",
            "Crescer junto",
            "Ninguém precisa saber tudo. A comunidade existe para trocar e evoluir.",
          ],
          [
            "03",
            "Gerar impacto",
            "Tecnologia ganha sentido quando melhora a universidade e a comunidade.",
          ],
        ].map(([number, title, text]) => (
          <article key={number}>
            <span>{number}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function IdeasPage({
  role,
  userEmail,
  notify,
}: {
  role: Role;
  userEmail: string;
  notify: (message: string) => void;
}) {
  const [submissions, setSubmissions] = useState<ApiIdea[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Nova guilda");
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<ApiIdea[]>("/ideas")
      .then((items) => {
        if (active) setSubmissions(items);
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "Erro ao carregar propostas."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateStatus = async (id: string, status: ApiIdea["status"]) => {
    try {
      const updated = await apiRequest<ApiIdea>(`/ideas/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setSubmissions((current) => current.map((submission) => submission.id === id ? updated : submission));
      notify(`Status da ideia atualizado para ${status.toLowerCase()}.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível atualizar o status.");
    }
  };

  if (role !== "student") {
    return (
      <div className="section-page">
        <section className="page-intro">
          <div>
            <p className="eyebrow">PARTICIPAÇÃO DA COMUNIDADE</p>
            <h1>Ideias recebidas</h1>
            <p>Leia as propostas e atualize o status para dar retorno aos estudantes.</p>
          </div>
          <div className="guild-live"><strong>{submissions.length} propostas</strong></div>
        </section>
        <section className="event-cards">
          {loading ? <p>Carregando propostas...</p> : submissions.length ? submissions.map((submission) => (
            <article key={submission.id}>
              <div className="event-card-copy">
                <span>{submission.category} · {submission.author.name} · {new Date(submission.createdAt).toLocaleDateString("pt-BR")}</span>
                <h2>{submission.title}</h2>
                <p>{submission.description}</p>
              </div>
              <label className="idea-status-control">
                Status
                <select value={submission.status} onChange={(event) => void updateStatus(submission.id, event.target.value as ApiIdea["status"])}>
                  <option value="Pendente">Pendente</option>
                  <option value="Aprovada">Aprovada</option>
                  <option value="Recusada">Recusada</option>
                </select>
              </label>
            </article>
          )) : <p>Ainda não há ideias enviadas.</p>}
        </section>
      </div>
    );
  }

  return (
    <div className="section-page">
      <section className="idea-layout">
        <div className="idea-copy">
          <p className="eyebrow">SUA VOZ NO BYTEHUB</p>
          <h1>
            Tem uma ideia?
            <br />
            <span>Joga na roda.</span>
          </h1>
          <p>
            Uma oficina, um evento, uma nova guilda ou um projeto maluco. Toda boa construção começa
            com alguém dizendo “e se...?”.
          </p>
          <div className="idea-steps">
            <span>1</span>
            <p>
              <strong>Conte sua ideia</strong>
              <small>Não precisa estar perfeita.</small>
            </p>
            <span>2</span>
            <p>
              <strong>A diretoria avalia</strong>
              <small>Você acompanha o retorno.</small>
            </p>
            <span>3</span>
            <p>
              <strong>A gente constrói</strong>
              <small>Boas ideias viram movimento.</small>
            </p>
          </div>
        </div>
        <form
          className="idea-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!idea.trim() || !title.trim()) return;
            void apiRequest<ApiIdea>("/ideas", {
              method: "POST",
              body: JSON.stringify({ title: title.trim(), category, description: idea.trim() }),
            })
              .then((submission) => {
                setSubmissions((current) => [submission, ...current]);
                notify("Ideia enviada para a diretoria. Obrigado por construir com a gente!");
                setTitle("");
                setCategory("Nova guilda");
                setIdea("");
              })
              .catch((error: unknown) => notify(error instanceof Error ? error.message : "Não foi possível enviar a ideia."));
          }}
        >
          <div className="form-spark">
            <Icon name="idea" />
          </div>
          <h2>Conte para a gente</h2>
          <p>Sua ideia será enviada diretamente à diretoria.</p>
          <label>
            Título da ideia
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Dê um nome para sua ideia" required />
          </label>
          <label>
            Categoria
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>Nova guilda</option>
              <option>Evento ou oficina</option>
              <option>Projeto</option>
              <option>Melhoria na liga</option>
            </select>
          </label>
          <label>
            Como funcionaria?
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Explique do seu jeito..."
              required
            />
          </label>
          <button type="submit">
            Enviar minha ideia <Icon name="arrow" size={17} />
          </button>
          <div className="my-ideas-list">
            <h3>Minhas ideias enviadas</h3>
            {submissions.filter((submission) => submission.author.email === userEmail).length ? (
              submissions
                .filter((submission) => submission.author.email === userEmail)
                .map((submission) => (
                  <article key={submission.id}>
                    <span>{submission.category}</span>
                    <strong>{submission.title}</strong>
                    <small>Status: {submission.status}</small>
                  </article>
                ))
            ) : <p>Suas propostas aparecerão aqui após o envio.</p>}
          </div>
        </form>
      </section>
    </div>
  );
}

function PresidentProfilesPage({ notify }: { notify: (message: string) => void }) {
  const [profiles, setProfiles] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [area, setArea] = useState("Acadêmico");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<ApiUser[]>("/users/directors")
      .then((items) => {
        if (active) setProfiles(items);
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "Erro ao carregar a diretoria."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const createMember = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail || password.length < 8) {
      setError("Preencha todos os campos e use uma senha com pelo menos 8 caracteres.");
      return;
    }
    setError("");
    try {
      const profile = await apiRequest<ApiUser>("/users/directors", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password, area }),
      });
      setProfiles((current) => [...current, profile]);
      setName("");
      setEmail("");
      setPassword("");
      setArea("Acadêmico");
      notify(`Perfil de ${profile.name} criado para o setor ${profile.area}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar o perfil.");
    }
  };

  return (
    <div className="section-page">
      <section className="president-header">
        <div>
          <p className="eyebrow">ACESSO EXCLUSIVO DA PRESIDÊNCIA</p>
          <h1>
            Novas pessoas,
            <br />
            novos acessos.
          </h1>
          <p>
            Crie perfis para membros da diretoria. Cada pessoa poderá entrar usando o e-mail e a
            senha definidos aqui.
          </p>
        </div>
        <div className="president-lock">
          <span>
            <Icon name="target" />
          </span>
          <div>
            <small>NÍVEL DE ACESSO</small>
            <strong>Presidência</strong>
          </div>
          <i>
            <Icon name="check" size={15} />
          </i>
        </div>
      </section>

      <section className="profile-management">
        <form className="director-profile-form" onSubmit={createMember}>
          <div className="form-heading">
            <span>
              <Icon name="plus" />
            </span>
            <div>
              <p className="eyebrow">NOVO MEMBRO</p>
              <h2>Criar perfil da diretoria</h2>
            </div>
          </div>
          <label>
            Nome completo
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Maria Silva"
              required
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="membro@email.com"
              required
            />
          </label>
          <div className="profile-form-row">
            <label>
              Setor
              <select value={area} onChange={(event) => setArea(event.target.value)}>
                {sectors.map((sector) => (
                  <option key={sector.name}>{sector.name}</option>
                ))}
              </select>
            </label>
            <label>
              Senha inicial
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
            </label>
          </div>
          {error && <p className="profile-form-error">{error}</p>}
          <button type="submit">
            Criar acesso da diretoria <Icon name="arrow" size={17} />
          </button>
          <small className="local-note">As senhas são protegidas no banco local do ByteHub.</small>
        </form>

        <div className="created-profiles">
          <div className="created-profiles-heading">
            <div>
              <p className="eyebrow">PERFIS CRIADOS</p>
              <h2>Membros com acesso</h2>
            </div>
            <span>{profiles.length}</span>
          </div>
          {loading ? <p>Carregando membros...</p> : profiles.length ? (
            <div className="created-profile-list">
              {profiles.map((profile) => (
                <article key={profile.email}>
                  <span>
                    {profile.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div>
                    <strong>{profile.name}</strong>
                    <small>{profile.email}</small>
                  </div>
                  <em>{profile.area}</em>
                </article>
              ))}
            </div>
          ) : (
            <div className="profiles-empty">
              <span>
                <Icon name="users" size={26} />
              </span>
              <h3>Nenhum perfil novo ainda</h3>
              <p>Os membros criados pela Presidência aparecerão aqui.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SimplePage({
  title,
  eyebrow,
  text,
  items,
}: {
  title: string;
  eyebrow: string;
  text: string;
  items: string[];
}) {
  return (
    <div className="section-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </section>
      <section className="simple-grid">
        {items.map((item, index) => (
          <article key={item}>
            <span>0{index + 1}</span>
            <Icon name={index % 2 ? "archive" : "users"} />
            <h2>{item}</h2>
            <p>Informações organizadas, responsáveis definidos e histórico acessível.</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default App;
