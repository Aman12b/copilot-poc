// Chat launcher + Copilot Studio Web Chat. Reads window.COPILOT_CONFIG.
(function () {
  const cfg = window.COPILOT_CONFIG || {};
  const WEBCHAT_CDN = "https://cdn.botframework.com/botframework-webchat/latest/webchat.js";
  let started = false;

  const css = `
  #cp-launcher{position:fixed;right:24px;bottom:24px;width:62px;height:62px;border-radius:50%;
    background:${cfg.primaryColor||"#e2001a"};color:#fff;border:none;cursor:pointer;z-index:2147483000;
    box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .2s}
  #cp-launcher:hover{transform:scale(1.07)}
  #cp-panel{position:fixed;right:24px;bottom:100px;width:380px;height:600px;max-height:calc(100vh - 130px);
    background:#fff;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.28);z-index:2147483000;
    display:none;flex-direction:column;overflow:hidden;font-family:system-ui,Segoe UI,Arial,sans-serif}
  #cp-panel.open{display:flex}
  #cp-head{background:${cfg.primaryColor||"#e2001a"};color:#fff;padding:14px 16px;display:flex;
    align-items:center;justify-content:space-between;font-weight:600}
  #cp-head button{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1}
  #cp-body{flex:1;min-height:0;position:relative}
  #cp-body iframe{width:100%;height:100%;border:0}
  #cp-msg{padding:24px;color:#444;font-size:14px;line-height:1.5}
  @media (max-width:480px){#cp-panel{right:0;bottom:0;width:100vw;height:100vh;max-height:none;border-radius:0}}`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const launcher = document.createElement("button");
  launcher.id = "cp-launcher";
  launcher.setAttribute("aria-label", "Chat öffnen");
  launcher.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z" opacity=".95"/></svg>';

  const panel = document.createElement("div");
  panel.id = "cp-panel";
  panel.innerHTML = `<div id="cp-head"><span>${cfg.botName||"Assistent"}</span>
    <button aria-label="Schließen">×</button></div><div id="cp-body"></div>`;

  document.body.append(launcher, panel);
  const body = panel.querySelector("#cp-body");
  const toggle = () => { panel.classList.toggle("open"); if (!started) { started = true; start(); } };
  launcher.onclick = toggle;
  panel.querySelector("#cp-head button").onclick = () => panel.classList.remove("open");

  const showMsg = (html) => { body.innerHTML = `<div id="cp-msg">${html}</div>`; };
  const notConfigured = (v) => !v || v.startsWith("PASTE_");

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (window.WebChat) return res();
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = () => rej(new Error("Web Chat script could not be loaded"));
      document.head.appendChild(s);
    });
  }

  async function start() {
    if (cfg.mode === "iframe") {
      if (notConfigured(cfg.iframeUrl)) return showMsg("<b>Not configured.</b><br>Set <code>iframeUrl</code> in config.js.");
      body.innerHTML = `<iframe src="${cfg.iframeUrl}" title="${cfg.botName}"></iframe>`;
      return;
    }
    if (notConfigured(cfg.tokenEndpoint)) return showMsg("<b>Not configured.</b><br>Set <code>tokenEndpoint</code> in config.js.");

    showMsg("Verbinde …");
    try {
      await loadScript(WEBCHAT_CDN);
      const tokenUrl = new URL(cfg.tokenEndpoint);
      const apiVersion = tokenUrl.searchParams.get("api-version") || "2022-03-01-preview";

      // Copilot Studio: get the regional Direct Line URL + a conversation token
      const [directLineURL, token] = await Promise.all([
        fetch(new URL(`/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`, tokenUrl))
          .then(r => { if (!r.ok) throw new Error("regionalchannelsettings " + r.status); return r.json(); })
          .then(j => j.channelUrlsById.directline),
        fetch(tokenUrl)
          .then(r => { if (!r.ok) throw new Error("token endpoint " + r.status); return r.json(); })
          .then(j => j.token)
      ]);

      const directLine = window.WebChat.createDirectLine({
        domain: new URL("v3/directline", directLineURL).toString(),
        token
      });

      // Fire the greeting topic once connected
      if (cfg.sendStartConversation !== false) {
        const sub = directLine.connectionStatus$.subscribe({
          next(status) {
            if (status === 2) {
              directLine.postActivity({
                type: "event", name: "startConversation",
                locale: cfg.locale || "de-AT",
                localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }).subscribe();
              sub.unsubscribe();
            }
          }
        });
      }

      body.innerHTML = "";
      const host = document.createElement("div");
      host.style.cssText = "height:100%";
      body.appendChild(host);

      window.WebChat.renderWebChat({
        directLine,
        locale: cfg.locale || "de-AT",
        styleOptions: {
          accent: cfg.primaryColor || "#e2001a",
          botAvatarInitials: cfg.botAvatarInitials || "Bot",
          userAvatarInitials: cfg.userAvatarInitials || "Ich",
          bubbleBorderRadius: 12,
          bubbleFromUserBorderRadius: 12,
          bubbleFromUserBackground: cfg.primaryColor || "#e2001a",
          bubbleFromUserTextColor: "#fff",
          suggestedActionLayout: "flow",
          hideUploadButton: true,
          sendBoxButtonColor: cfg.primaryColor || "#e2001a"
        }
      }, host);
    } catch (e) {
      console.error("[Copilot POC]", e);
      showMsg(`<b>Connection failed.</b><br>${e.message}<br><br>
        Check: token endpoint copied completely, agent published, authentication set to "No authentication".`);
    }
  }
})();
