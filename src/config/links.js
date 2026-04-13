/**
 * URLs come from Vite env (`import.meta.env`). See `.env` / `.env.example`.
 * SharePoint "browse" links (`/my?viewid=...`) are rewritten to use
 * `/_layouts/15/download.aspx?SourceUrl=...` when possible so the browser
 * receives a file download instead of the folder preview page.
 */

const env = import.meta.env;

function getStr(key) {
  const v = env[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : "";
}

/** Dashboard row: specific key, else `VITE_DASHBOARD_URL`. */
function dash(key) {
  const specific = getStr(key);
  if (specific) return specific;
  return getStr("VITE_DASHBOARD_URL");
}

/**
 * Turn SharePoint / OneDrive browse URLs into download.aspx when we can derive
 * the file path from `id=`. Otherwise keep URL and append `download=1` if missing.
 */
function normalizeDownloadUrl(raw) {
  if (!raw) return "";

  const u = raw.trim();

  // Set VITE_USE_RAW_DOWNLOAD_URL=1 in .env to skip SharePoint rewriting (e.g. you pasted a working direct URL)
  if (getStr("VITE_USE_RAW_DOWNLOAD_URL") === "1") {
    return u;
  }

  if (!/sharepoint\.com/i.test(u)) {
    return u;
  }

  if (/\/download\.aspx/i.test(u)) {
    return u;
  }

  try {
    const parsed = new URL(u);
    const host = parsed.hostname;
    const id = parsed.searchParams.get("id");

    if (
      id &&
      (parsed.pathname.includes("/my") || parsed.searchParams.has("viewid"))
    ) {
      let relPath = decodeURIComponent(id.replace(/\+/g, " "));
      if (!relPath.startsWith("/")) {
        relPath = `/${relPath}`;
      }

      if (relPath.startsWith("/personal/")) {
        const seg = relPath.match(/^\/personal\/([^/]+)/);
        if (seg) {
          const fileUrl = `https://${host}${relPath}`;
          const downloadAspx = `https://${host}/personal/${seg[1]}/_layouts/15/download.aspx`;
          // Absolute document URL (required by many tenants; preserves path encoding)
          return `${downloadAspx}?SourceUrl=${encodeURIComponent(fileUrl)}`;
        }
      }
    }
  } catch {
    /* fall through */
  }

  if (u.includes("download=1")) {
    return u;
  }
  return u.includes("?") ? `${u}&download=1` : `${u}?download=1`;
}

export function getLinksFor(channel, platform) {
  const isWeb = channel === "web";
  const isWin = platform === "windows";

  if (isWeb && isWin) {
    return {
      download: normalizeDownloadUrl(getStr("VITE_WEB_WINDOWS_DOWNLOAD")),
      dashboard: dash("VITE_WEB_WINDOWS_DASHBOARD"),
      handout: getStr("VITE_WEB_WINDOWS_HANDOUT"),
    };
  }
  if (isWeb && !isWin) {
    return {
      download: normalizeDownloadUrl(getStr("VITE_WEB_MAC_DOWNLOAD")),
      dashboard: dash("VITE_WEB_MAC_DASHBOARD"),
      handout: getStr("VITE_WEB_MAC_HANDOUT"),
    };
  }
  if (!isWeb && isWin) {
    return {
      download: normalizeDownloadUrl(getStr("VITE_DESKTOP_WINDOWS_DOWNLOAD")),
      dashboard: dash("VITE_DESKTOP_WINDOWS_DASHBOARD"),
      handout: getStr("VITE_DESKTOP_WINDOWS_HANDOUT"),
    };
  }
  return {
    download: normalizeDownloadUrl(getStr("VITE_DESKTOP_MAC_DOWNLOAD")),
    dashboard: dash("VITE_DESKTOP_MAC_DASHBOARD"),
    handout: getStr("VITE_DESKTOP_MAC_HANDOUT"),
  };
}
