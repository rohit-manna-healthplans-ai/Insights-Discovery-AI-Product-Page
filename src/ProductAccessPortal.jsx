import { useCallback, useEffect, useId, useState } from "react";
import {
  AppWindow,
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Laptop,
  Monitor,
  Sparkles,
  X,
  ChevronLeft,
} from "lucide-react";
import { getLinksFor } from "./config/links.js";

const PRODUCT = {
  title: "Insights Discovery AI",
  description:
    "Insights Discovery AI Description — access the web experience or install the desktop application. Pick your channel, then your platform, and open downloads, the live dashboard, or product handouts.",
};

const MAIN_CARDS = {
  web: {
    id: "web",
    label: "Web",
    subtitle: "Browser-based access",
    description:
      "Run Insights Discovery AI in a supported browser without installing a desktop client. Best for quick demos, shared machines, and environments where installs are restricted. Choose Windows or macOS-aligned browser builds in the next step.",
    icon: Globe,
  },
  desktop: {
    id: "desktop",
    label: "Desktop",
    subtitle: "Native application",
    description:
      "Install the full desktop experience for deeper integrations, offline-capable workflows, and the Windows installer from your SharePoint folder. Select your operating system in the popup to get download, dashboard, and handout links.",
    icon: Monitor,
  },
};

const PLATFORMS = {
  windows: {
    id: "windows",
    label: "Windows",
    description:
      "Use this path for Windows 10/11 builds. The desktop installer is packaged as a ZIP containing the setup bundle; the web row may reference a Windows-targeted browser package when available.",
    icon: AppWindow,
  },
  mac: {
    id: "mac",
    label: "Mac",
    description:
      "Apple silicon and Intel builds are listed here when published. Web entries may point to a macOS-optimized bundle; desktop entries use DMG or PKG links from your share folder when you add them in `.env`.",
    icon: Laptop,
  },
};

function ActionLinks({ channel, platform }) {
  const links = getLinksFor(channel, platform);
  const isDesktop = channel === "desktop";

  const downloadLabel = isDesktop
    ? "Download application"
    : "Download package";

  const guard = (url, e) => {
    if (!url) e.preventDefault();
  };

  return (
    <div className="action-grid">
      <a
        className="action-btn action-btn--primary"
        href={links.download || "#"}
        onClick={(e) => guard(links.download, e)}
        target="_blank"
        rel="noopener"
        aria-disabled={!links.download}
      >
        <Download size={18} aria-hidden />
        <span>{downloadLabel}</span>
      </a>
      <a
        className="action-btn"
        href={links.dashboard || "#"}
        onClick={(e) => guard(links.dashboard, e)}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!links.dashboard}
      >
        <ExternalLink size={18} aria-hidden />
        <span>Dashboard</span>
      </a>
      <a
        className="action-btn"
        href={links.handout || "#"}
        onClick={(e) => guard(links.handout, e)}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!links.handout}
      >
        <FileText size={18} aria-hidden />
        <span>Handout</span>
      </a>
    </div>
  );
}

export default function ProductAccessPortal() {
  const [modal, setModal] = useState(null);

  const closeModal = useCallback(() => setModal(null), []);

  const openChannel = useCallback((channel) => {
    setModal({ channel, step: "platform" });
  }, []);

  const selectPlatform = useCallback((platform) => {
    setModal((m) =>
      m ? { ...m, step: "actions", platform } : null
    );
  }, []);

  const goBackInModal = useCallback(() => {
    setModal((m) => {
      if (!m) return null;
      if (m.step === "actions") {
        return { channel: m.channel, step: "platform" };
      }
      return null;
    });
  }, []);

  useEffect(() => {
    if (!modal) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  useEffect(() => {
    if (modal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [modal]);

  return (
    <div className="portal">
      <header className="site-header">
        <div className="site-header__inner">
          <img
            className="site-header__logo"
            src="/hp_logo.png"
            alt="healthplans.ai"
          />
        </div>
      </header>

      <main className="site-main">
        <section
          className="product-intro"
          aria-labelledby="product-intro-title"
        >
          <div className="product-intro__copy">
            <p className="product-intro__eyebrow">
              <Sparkles size={14} aria-hidden /> Product portal
            </p>
            <h1 id="product-intro-title" className="product-intro__title">
              {PRODUCT.title}
            </h1>
            <p className="product-intro__desc">{PRODUCT.description}</p>
          </div>
          <div className="product-intro__art">
            <img
              src="/plugin.png"
              alt=""
              className="product-intro__img"
            />
          </div>
        </section>

        <section className="channels" aria-label="Choose web or desktop">
          <div className="channels__grid">
            <MainChannelCard
              config={MAIN_CARDS.web}
              onOpen={() => openChannel("web")}
            />
            <MainChannelCard
              config={MAIN_CARDS.desktop}
              onOpen={() => openChannel("desktop")}
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand" aria-label="healthplans.ai">
            <span className="site-footer__brand-strong">healthplans</span>
            <span className="site-footer__brand-star" aria-hidden>
              ✦
            </span>
            <span className="site-footer__brand-light">.ai</span>
          </div>
          <p className="site-footer__tagline">
            Insights Discovery AI · product distribution
          </p>
        </div>
      </footer>

      {modal && (
        <ChannelModal
          modal={modal}
          onClose={closeModal}
          onSelectPlatform={selectPlatform}
          onBack={goBackInModal}
        />
      )}
    </div>
  );
}

function MainChannelCard({ config, onOpen }) {
  const Icon = config.icon;

  return (
    <article className="main-card">
      <button
        type="button"
        className="main-card__trigger"
        onClick={onOpen}
      >
        <div className="main-card__row">
          <div className="main-card__icon-wrap">
            <Icon size={28} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="main-card__headlines">
            <h2 className="main-card__title">{config.label}</h2>
            <p className="main-card__subtitle">{config.subtitle}</p>
          </div>
          <span className="main-card__open-hint" aria-hidden>
            <ArrowRight size={22} />
          </span>
        </div>

        <p className="main-card__body">{config.description}</p>
        <p className="main-card__cta">Click to choose platform &amp; links</p>
      </button>
    </article>
  );
}

function ChannelModal({ modal, onClose, onSelectPlatform, onBack }) {
  const titleId = useId();
  const channelConfig = MAIN_CARDS[modal.channel];
  const ChannelIcon = channelConfig.icon;
  const isActions = modal.step === "actions" && modal.platform;
  const platformMeta = isActions ? PLATFORMS[modal.platform] : null;

  return (
    <div
      className="modal-root"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-panel__top">
          {modal.step === "actions" ? (
            <button
              type="button"
              className="modal-icon-btn"
              onClick={onBack}
              aria-label="Back to platform choice"
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <span className="modal-panel__spacer" aria-hidden />
          )}
          <button
            type="button"
            className="modal-icon-btn modal-icon-btn--close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="modal-panel__hero">
          <div className="modal-panel__brand">
            <span className="modal-panel__brand-icon">
              <ChannelIcon size={26} strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <h2 id={titleId} className="modal-panel__title">
                {isActions
                  ? `${channelConfig.label} · ${platformMeta.label}`
                  : channelConfig.label}
              </h2>
              <p className="modal-panel__subtitle">
                {isActions
                  ? "Download, open the dashboard, or grab the handout."
                  : "Choose your platform to continue."}
              </p>
            </div>
          </div>
        </div>

        <div
          key={modal.step + (modal.platform || "")}
          className="modal-pane"
        >
          {modal.step === "platform" && (
            <div className="platform-row platform-row--modal">
              {["windows", "mac"].map((pid) => {
                const p = PLATFORMS[pid];
                const PIcon = p.icon;
                return (
                  <button
                    key={pid}
                    type="button"
                    className="platform-card"
                    onClick={() => onSelectPlatform(pid)}
                  >
                    <div className="platform-card__top">
                      <span className="platform-card__icon">
                        <PIcon size={22} strokeWidth={1.75} aria-hidden />
                      </span>
                      <span className="platform-card__label">{p.label}</span>
                      <ArrowRight
                        className="platform-card__arrow"
                        size={18}
                        aria-hidden
                      />
                    </div>
                    <p className="platform-card__desc">{p.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {modal.step === "actions" && modal.platform && (
            <div className="modal-actions-block">
              <p className="platform-actions__hint">
                Resources for {channelConfig.label} · {platformMeta.label}
              </p>
              <ActionLinks
                channel={modal.channel}
                platform={modal.platform}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
