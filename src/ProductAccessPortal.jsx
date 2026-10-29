import { useCallback, useEffect, useId, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Download,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Lock,
  Monitor,
  Sparkles,
  X,
} from "lucide-react";
import { getLinksFor } from "./config/links.js";

const BASE = import.meta.env.BASE_URL;

const PRODUCT = {
  title: "Insights Discovery AI",
  description:
    "Your gateway to Insights Discovery AI. Pick how you want to work — install the desktop application, or wait for the browser experience that is on its way.",
};

const CHANNELS = [
  {
    id: "desktop",
    label: "Desktop",
    subtitle: "Native application",
    description:
      "Install the full desktop experience, open the product handbook and jump straight into the live dashboard — all from one place.",
    icon: Monitor,
    locked: false,
  },
  {
    id: "web",
    label: "Web",
    subtitle: "Browser-based access",
    description:
      "Run Insights Discovery AI right in your browser with nothing to install. This version is being finalised and will be available soon.",
    icon: Globe,
    locked: true,
  },
];

const RESOURCES = [
  {
    id: "handbook",
    linkKey: "handout",
    label: "Handbook",
    description: "Open the product handbook and learn how everything works.",
    action: "Open handbook",
    icon: BookOpen,
  },
  {
    id: "application",
    linkKey: "download",
    label: "Application",
    description: "Download and install the application on your computer.",
    action: "Download app",
    icon: Download,
  },
  {
    id: "dashboard",
    linkKey: "dashboard",
    label: "Dashboard",
    description: "Go to the live dashboard and start exploring insights.",
    action: "Open dashboard",
    icon: LayoutDashboard,
  },
];

/** Pick the link for the visitor's OS, falling back to the other OS if unset. */
function resolveLinks(channel) {
  const isMac = /Mac|iPhone|iPad/i.test(navigator.userAgent);
  const primary = getLinksFor(channel, isMac ? "mac" : "windows");
  const fallback = getLinksFor(channel, isMac ? "windows" : "mac");
  return {
    download: primary.download || fallback.download,
    dashboard: primary.dashboard || fallback.dashboard,
    handout: primary.handout || fallback.handout,
  };
}

export default function ProductAccessPortal() {
  const [openChannel, setOpenChannel] = useState(null);
  const closeModal = useCallback(() => setOpenChannel(null), []);

  useEffect(() => {
    if (!openChannel) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openChannel, closeModal]);

  return (
    <div className="portal">
      <div className="bg-orbs" aria-hidden>
        <span className="bg-orbs__orb bg-orbs__orb--a" />
        <span className="bg-orbs__orb bg-orbs__orb--b" />
        <span className="bg-orbs__orb bg-orbs__orb--c" />
      </div>

      <header className="site-header">
        <div className="site-header__inner">
          <img
            className="site-header__logo"
            src={`${BASE}hp_logo.png`}
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
              src={`${BASE}plugin.png`}
              alt=""
              className="product-intro__img"
            />
          </div>
        </section>

        <section className="channels" aria-label="Choose desktop or web">
          <div className="channels__grid">
            {CHANNELS.map((config, i) => (
              <ChannelCard
                key={config.id}
                config={config}
                index={i}
                onOpen={() => setOpenChannel(config.id)}
              />
            ))}
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

      {openChannel && (
        <ResourceModal
          channel={CHANNELS.find((c) => c.id === openChannel)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function ChannelCard({ config, index, onOpen }) {
  const Icon = config.icon;
  const { locked } = config;

  return (
    <article
      className={`main-card${locked ? " main-card--locked" : ""}`}
      style={{ "--i": index }}
    >
      <button
        type="button"
        className="main-card__trigger"
        onClick={locked ? undefined : onOpen}
        aria-disabled={locked}
      >
        <div className="main-card__row">
          <div className="main-card__icon-wrap">
            <Icon size={28} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="main-card__headlines">
            <h2 className="main-card__title">{config.label}</h2>
            <p className="main-card__subtitle">{config.subtitle}</p>
          </div>
          {locked ? (
            <span className="main-card__badge">
              <Lock size={13} aria-hidden /> Coming soon
            </span>
          ) : (
            <span className="main-card__open-hint" aria-hidden>
              <ArrowRight size={22} />
            </span>
          )}
        </div>

        <p className="main-card__body">{config.description}</p>
        <p className="main-card__cta">
          {locked ? (
            <>
              <Lock size={14} aria-hidden /> Locked for now
            </>
          ) : (
            <>Click to open resources</>
          )}
        </p>
      </button>
    </article>
  );
}

function ResourceModal({ channel, onClose }) {
  const titleId = useId();
  const ChannelIcon = channel.icon;
  const links = resolveLinks(channel.id);

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
          <div className="modal-panel__brand">
            <span className="modal-panel__brand-icon">
              <ChannelIcon size={26} strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <h2 id={titleId} className="modal-panel__title">
                {channel.label}
              </h2>
              <p className="modal-panel__subtitle">
                Choose what you would like to do.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="resource-grid">
          {RESOURCES.map((r, i) => (
            <ResourceCard
              key={r.id}
              resource={r}
              url={links[r.linkKey]}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource, url, index }) {
  const Icon = resource.icon;
  const disabled = !url;
  const isDownload = resource.id === "application";

  return (
    <a
      className={`resource-card${disabled ? " resource-card--disabled" : ""}`}
      style={{ "--i": index }}
      href={url || "#"}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      target={isDownload ? undefined : "_blank"}
      rel="noopener noreferrer"
      aria-disabled={disabled}
    >
      <span className="resource-card__icon">
        <Icon size={26} strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="resource-card__title">{resource.label}</h3>
      <p className="resource-card__desc">{resource.description}</p>
      <span className="resource-card__action">
        {disabled ? (
          "Link not available yet"
        ) : (
          <>
            {resource.action}
            {isDownload ? (
              <Download size={16} aria-hidden />
            ) : (
              <ExternalLink size={16} aria-hidden />
            )}
          </>
        )}
      </span>
    </a>
  );
}
