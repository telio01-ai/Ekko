// Fonction serverless Vercel : /api/chat
// Reçoit l'historique de la conversation depuis le front, appelle Groq (gratuit) côté serveur,
// et renvoie la réponse. La clé API reste secrète (variable d'environnement Vercel).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Aucun message reçu' });
  }

  const systemPrompt =
    "Tu es Ekko, un assistant IA chaleureux, direct et compétent, conçu pour aider les humains à résoudre des problèmes concrets et répondre à leurs questions. Réponds dans la langue de l'utilisateur, de façon claire et concise, sans détour inutile.";

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [{ role: 'system', content: systemPrompt }, ...messages]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur API Groq:', data);
      return res.status(response.status).json({ error: "Erreur de l'API Groq", details: data });
    }

    const answer = data.choices?.[0]?.message?.content || "Je n'ai pas pu formuler de réponse.";

    return res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
