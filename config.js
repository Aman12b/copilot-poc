// ============================================================
//  Copilot Studio – the ONLY file you need to edit
// ============================================================
//
//  Option A (recommended): "webchat" mode
//    Copilot Studio → your agent → Settings → Channels → "Web app"
//    (or "Mobile app") → copy the TOKEN ENDPOINT URL.
//    It looks like:
//    https://<env>.environment.api.powerplatform.com/powervirtualagents/botsbyschema/<schema>/directline/token?api-version=2022-03-01-preview
//
//  Option B: "iframe" mode
//    Copilot Studio → Channels → "Web app" → copy the iframe SRC URL.
//    Fastest, but no custom styling.
//
//  Authentication: for this POC set the agent to "No authentication"
//  (Settings → Security → Authentication). With Entra ID / manual auth
//  the token endpoint needs a signed-in user and this page won't work as-is.
// ============================================================

window.COPILOT_CONFIG = {
  mode: "webchat",            // "webchat" | "iframe"

  tokenEndpoint: "PASTE_TOKEN_ENDPOINT_HERE",   // used in webchat mode
  iframeUrl:     "PASTE_IFRAME_SRC_HERE",       // used in iframe mode

  botName: "Digitaler Assistent",
  locale: "de-AT",
  sendStartConversation: true, // triggers the Conversation Start topic (greeting)

  // Look & feel of the chat window
  primaryColor: "#e2001a",
  botAvatarInitials: "DA",
  userAvatarInitials: "Sie"
};
