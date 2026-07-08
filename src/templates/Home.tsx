import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Shield, Database, Globe, CheckCircle2, Upload, Key, Server } from "lucide-react";
import Top from "../components/Home/Top";
import useVisualContext from "../hook/useVisualContext";
import type { TierType } from "../@types/Tier";
import liberty from "../assets/liberty.png";
import TBG from "../assets/tbg.png";

// ── Scroll fade-in hook ───────────────────────────────────────────
const useScrollFade = () => {
  useEffect(() => {
    const els = document.querySelectorAll(".scroll-fade");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

// ── Section wrapper ───────────────────────────────────────────────
const Section = ({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) => (
  <section id={id} className={`max-w-6xl mx-auto px-6 ${className}`}>{children}</section>
);

const partners = [
  { name: "Liberty City", logo: liberty },
  { name: "The Best Gaming", logo: TBG },
  { name: "Liberty City", logo: liberty },
  { name: "The Best Gaming", logo: TBG },
  { name: "Liberty City", logo: liberty },
  { name: "The Best Gaming", logo: TBG },
];

const benefits = [
  {
    icon: <Zap size={20} />,
    title: "Alta Velocidade",
    description: "CDN global com latência mínima para seus players, onde quer que estejam.",
  },
  {
    icon: <Shield size={20} />,
    title: "Segurança Máxima",
    description: "Criptografia de ponta a ponta e acesso controlado por chaves de API.",
  },
  {
    icon: <Database size={20} />,
    title: "Bucket Próprio",
    description: "Cada servidor recebe seu próprio bucket R2 isolado na Cloudflare.",
  },
  {
    icon: <Globe size={20} />,
    title: "Configuração de Outros Domínios",
    description: "Configure para outros domínios ou use um subdomínio compartilhado da 5Keepr.",
  },
];

const steps = [
  { icon: <Upload size={22} />, step: "01", title: "Crie sua conta", desc: "Registre-se grátis em segundos. Sem cartão de crédito." },
  { icon: <Server size={22} />, step: "02", title: "Configure o storage", desc: "Configure para outros domínios ou use subdomínio 5Keepr com 1 clique." },
  { icon: <Key size={22} />, step: "03", title: "Gere sua API Key", desc: "Crie chaves de leitura ou escrita para cada servidor FiveM." },
  { icon: <Zap size={22} />, step: "04", title: "Faça upload", desc: "Envie texturas, modelos e assets direto pelo painel ou API." },
];

const Home = () => {
  const { tiers } = useVisualContext();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  useScrollFade();

  return (
    <div className="min-h-screen bg-[#080809] text-white overflow-x-hidden">
      <Top />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden" ref={heroRef}>
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-0 animate-fade-in delay-100" style={{ animationFillMode: "forwards" }} />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[#e8073f] opacity-[0.06] blur-[140px] pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-[#e8073f] opacity-[0.04] blur-[100px] pointer-events-none animate-float" style={{ animationDelay: "1s" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="animate-fade-in-up delay-100 inline-flex items-center gap-2 bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8073f] animate-pulse" />
            Storage profissional para servidores FiveM
          </div>

          <h1 className="animate-fade-in-up delay-200 text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight max-w-5xl mb-6">
            Seu storage.{" "}
            <span className="text-gradient">Sua velocidade.</span>
          </h1>

          <p className="animate-fade-in-up delay-300 text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
            Hospede texturas, modelos e assets do seu servidor FiveM com alta disponibilidade,
            latência mínima e configuração de outros domínios.
          </p>

          <div className="animate-fade-in-up delay-400 flex flex-wrap gap-3 justify-center mb-16">
            <button
              onClick={() => navigate("/account?mode=register")}
              className="group flex items-center gap-2 bg-[#e8073f] hover:bg-[#c8063a] text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#e8073f30] hover:shadow-[#e8073f50] hover:scale-105"
            >
              Começar Grátis
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              Ver Planos
            </button>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up delay-500 flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: "99,9%", label: "Uptime garantido" },
              { value: "< 50ms", label: "Latência média" },
              { value: "R2", label: "Powered by Cloudflare" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080809] to-transparent pointer-events-none" />
      </div>

      {/* ── MARQUEE PARCEIROS ─────────────────────────────────────── */}
      <div className="border-y border-white/5 py-5 overflow-hidden bg-white/[0.02] flex gap-0 relative">
        <div className="flex animate-marquee whitespace-nowrap shrink-0">
          {partners.map((p, i) => (
            <div key={i} className="flex items-center gap-3 mx-12 opacity-40 hover:opacity-70 transition-opacity">
              <img src={p.logo} alt={p.name} className="h-7 object-contain grayscale" />
              <span className="text-sm font-medium text-zinc-400 whitespace-nowrap">{p.name}</span>
            </div>
          ))}
        </div>
        <div className="flex animate-marquee whitespace-nowrap shrink-0" aria-hidden="true">
          {partners.map((p, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-3 mx-12 opacity-40 hover:opacity-70 transition-opacity">
              <img src={p.logo} alt={p.name} className="h-7 object-contain grayscale" />
              <span className="text-sm font-medium text-zinc-400 whitespace-nowrap">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BENEFÍCIOS ───────────────────────────────────────────── */}
      <Section className="py-28">
        <div className="scroll-fade text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#e8073f] mb-3 block">Por que 5Keepr</span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Tudo que seu servidor precisa</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Infraestrutura de nível enterprise, acessível para qualquer tamanho de comunidade.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <div
              key={i}
              className={`scroll-fade card-glass rounded-2xl p-6 delay-${(i + 1) * 100}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#e8073f15] border border-[#e8073f30] flex items-center justify-center text-[#e8073f] mb-4">
                {b.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{b.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────── */}
      <Section id="como-funciona" className="py-28">
        <div className="scroll-fade text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#e8073f] mb-3 block">Simples assim</span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Configure em minutos</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Do cadastro ao primeiro upload, menos de 5 minutos.</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 3 segmentos de linha — cada um some nas pontas, evitando sobrepor os ícones */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="hidden md:block absolute h-px pointer-events-none"
              style={{
                top: "28px",
                left: `calc(${12.5 + i * 25}% + 32px)`,
                width: `calc(25% - 64px)`,
                background: "linear-gradient(to right, transparent 0%, #e8073f50 30%, #e8073f50 70%, transparent 100%)",
              }}
            />
          ))}

          {steps.map((s, i) => (
            <div key={i} className={`scroll-fade delay-${(i + 1) * 100} flex flex-col items-center text-center`}>
              <div className="relative mb-5 z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#e8073f10] border border-[#e8073f30] flex items-center justify-center text-[#e8073f]">
                  {s.icon}
                </div>
                <span className="absolute -top-2 -right-2 text-[10px] font-black text-[#e8073f] bg-[#080809] px-1">{s.step}</span>
              </div>
              <h3 className="font-bold text-white mb-1.5">{s.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PLANOS ───────────────────────────────────────────────── */}
      <Section className="py-28" >
        <div className="scroll-fade text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#e8073f] mb-3 block">Preços</span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Planos para todo tamanho</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Mais storage pelo menor preço do mercado. Cancele quando quiser.</p>
        </div>

        <div id="planos" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier: TierType, i: number) => {
            const isPro = tier.id === "pro";
            return (
              <div
                key={tier.id}
                className={`scroll-fade delay-${(i + 1) * 100} relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                  isPro
                    ? "bg-[#e8073f08] border-2 border-[#e8073f] animate-pulse-glow"
                    : "card-glass"
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#e8073f] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Mais popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    {tier.cost === 0 ? (
                      <span className="text-4xl font-black text-white">Grátis</span>
                    ) : (
                      <>
                        <span className="text-sm text-zinc-500">R$</span>
                        <span className="text-4xl font-black text-white">
                          {tier.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-zinc-500 text-sm">/mês</span>
                      </>
                    )}
                  </div>
                  <p className="text-zinc-500 text-xs leading-relaxed">{tier.description?.pt}</p>
                </div>

                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {tier.included?.map((item: { pt: string; en: string }, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle2 size={14} className="text-[#e8073f] shrink-0 mt-0.5" />
                      {item.pt}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate(tier.cost === 0 ? "/account?mode=register" : `/checkout?tier=${tier.id}`)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isPro
                      ? "bg-[#e8073f] hover:bg-[#c8063a] text-white shadow-lg shadow-[#e8073f30]"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white"
                  }`}
                >
                  {tier.cost === 0 ? "Começar Grátis" : "Assinar agora"}
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── CTA FINAL ────────────────────────────────────────────── */}
      <Section className="py-28">
        <div className="scroll-fade relative rounded-3xl overflow-hidden p-12 text-center">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8073f12] via-[#08080900] to-[#e8073f08]" />
          <div className="absolute inset-0 border border-[#e8073f20] rounded-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#e8073f] opacity-[0.05] blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Pronto para decolar?
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              Crie sua conta grátis agora e configure seu storage em menos de 5 minutos.
            </p>
            <button
              onClick={() => navigate("/account?mode=register")}
              className="group inline-flex items-center gap-2 bg-[#e8073f] hover:bg-[#c8063a] text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-[#e8073f30] hover:shadow-[#e8073f50] hover:scale-105"
            >
              Criar conta grátis
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 text-center text-zinc-600 text-sm">
        © {new Date().getFullYear()} 5Keepr. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Home;
