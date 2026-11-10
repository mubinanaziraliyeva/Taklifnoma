const BOT_TOKEN = process.env.BOT_TOKEN || "BU_YERGA_TOKEN";
const CHAT_ID = process.env.CHAT_ID || "BU_YERGA_CHAT_ID";

const esc = (t) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const { name, coming, wish, website } = req.body || {};
  if (website) return res.status(200).json({ ok: true }); // spam tuzogʻi (honeypot)

  const n = String(name || "")
    .trim()
    .slice(0, 60);
  const w = String(wish || "")
    .trim()
    .slice(0, 800);
  if (!n) return res.status(400).json({ ok: false });

  const text =
    "💌 <b>Yangi javob</b>\n\n" +
    "👤 " +
    esc(n) +
    "\n" +
    (coming ? "✅ <b>Keladi</b>" : "❌ <b>Kela olmaydi</b>") +
    (w ? "\n\n💬 " + esc(w) : "");

  try {
    const ids = CHAT_ID.split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const results = await Promise.all(
      ids.map((id) =>
        fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: id, text, parse_mode: "HTML" }),
        }),
      ),
    );
    const ok = results.some((r) => r.ok);
    return res.status(ok ? 200 : 502).json({ ok });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
};
