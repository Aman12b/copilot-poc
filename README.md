# Copilot Studio – Website Chat POC

## Files
| File | Purpose |
|---|---|
| `config.js` | **The only file you edit** – paste your Copilot Studio token endpoint (or iframe URL) |
| `chatbot.js` | Chat bubble + panel, loads Microsoft Bot Framework Web Chat and connects via Direct Line |
| `index.html` | Neutral energy-provider demo page (labeled as prototype) |
| `copilot-overlay.user.js` | Tampermonkey userscript: shows the same chat bubble on wienenergie.at, in your browser only |

## 1. Prepare the agent in Copilot Studio
1. Open your agent → **Settings → Security → Authentication** → *No authentication* (for the POC).
2. **Publish** the agent.
3. **Settings → Channels → Web app** (or *Mobile app*) → copy the **Token Endpoint**.
   - Alternatively copy the **iframe `src`** URL for iframe mode.

## 2. Configure
In `config.js`:
```js
mode: "webchat",
tokenEndpoint: "https://…/directline/token?api-version=2022-03-01-preview",
```
or
```js
mode: "iframe",
iframeUrl: "https://copilotstudio.microsoft.com/environments/…/webchat?__version__=2",
```

## 3. Run locally
Opening `index.html` via `file://` can block the fetch calls – use a small local server:
```bash
cd copilot-poc
npx serve .          # or: python -m http.server 8080
```
Open http://localhost:3000 (or :8080) → click the red bubble bottom right.

## 4. Demo on the real site (optional)
1. Install the **Tampermonkey** browser extension.
2. Create a new script, paste `copilot-overlay.user.js`, and fill in the config block at the top.
3. Open https://www.wienenergie.at/ → the chat bubble appears bottom right.

This only changes what *your* browser renders; nothing is deployed. If the site's
Content-Security-Policy blocks the token fetch / websocket, switch to `mode: "iframe"`,
or use the local demo page instead.

## Troubleshooting
| Symptom | Fix |
|---|---|
| "Not configured" | Placeholder still in `config.js` |
| `token endpoint 401/403` | Agent uses authentication → set *No authentication* or implement sign-in |
| `token endpoint 404` | Agent not published, or URL copied incompletely |
| Bot doesn't greet | Keep `sendStartConversation: true`; check the *Conversation Start* topic |
| CORS error | Serve via `localhost`, not `file://` |

## Next steps for the DCCP use case
- Live-agent handoff: *Transfer to agent* node in Copilot Studio + Omnichannel / Dynamics 365 Contact Center.
- Pass page context (URL, customer number) via `directLine.postActivity({ type: "event", name: "pageContext", value: {...} })`.
- Production: replace the anonymous token endpoint with a backend that issues tokens (and Entra ID SSO if needed).
