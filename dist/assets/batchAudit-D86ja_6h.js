var p={};const i=p.VITE_OPENAI_API_KEY||"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",l=`
Você é um especialista em auditoria de Google Meu Negócio (GMB/GMN).

Analise a seguinte empresa REAL e forneça uma auditoria completa baseada nos 12 critérios:

EMPRESA: {company_name}
CIDADE: {city}
ESTADO: {state}
CATEGORIA: {category}
TELEFONE: {phone}
ENDEREÇO: {address}
WEBSITE: {website}

📋 12 CRITÉRIOS DE AUDITORIA GMN:

1. Presença e verificação - Perfil existe e está verificado?
2. Consistência NAP - Nome, Endereço, Telefone consistentes?
3. Categorias - Categorias principais e secundárias corretas?
4. Horário de funcionamento - Horário atualizado e correto?
5. Fotos e vídeos - Mínimo de 10 fotos de qualidade?
6. Geotags nas imagens - Fotos com geolocalização?
7. Postagens recentes - Pelo menos 2 postagens por semana?
8. Avaliações - Quantidade e qualidade das avaliações?
9. Taxa de resposta - Proprietário responde avaliações?
10. Palavras-chave e SEO - Perfil otimizado para busca local?
11. Linkagem site/redes - Links para site e redes sociais?
12. Performance comparativa - Como está versus concorrentes?

IMPORTANTE: Retorne APENAS um JSON válido (sem markdown, sem texto adicional):

{
  "has_gmn_profile": true,
  "verification_status": "Verificado" | "Não verificado" | "Perfil não encontrado",
  "nap_consistency_score": 85,
  "has_products": true,
  "images_count": 15,
  "has_geotags": true,
  "posts_per_week": 2.5,
  "rating": 4.5,
  "total_reviews": 127,
  "review_response_rate": 85,
  "seo_score": 78,
  "engagement_score": 82,
  "overall_score": 75,
  "improvement_points": [
    "Adicionar mais 5 fotos de produtos",
    "Responder todas avaliações antigas",
    "Criar 2 postagens por semana",
    "Otimizar descrição com palavras-chave locais",
    "Adicionar horários especiais de feriados"
  ],
  "should_invite_for_optimization": true
}

REGRAS:
- has_gmn_profile: false se empresa NÃO tem perfil no GMN
- verification_status: "Perfil não encontrado" se não tiver perfil
- Todos os scores de 0 a 100
- overall_score: média ponderada de todos critérios
- improvement_points: 5 ações prioritárias e específicas
- should_invite_for_optimization: true se score < 70 ou não tem perfil
- rating: 0 a 5.0 (nota do Google)
- Se não tiver perfil, coloque valores baixos/zero nos campos numéricos
`;async function u(e){var s,r;if(!i)throw new Error("OpenAI API key not configured");const n=l.replace("{company_name}",e.company_name).replace("{city}",e.city).replace("{state}",e.state||"N/A").replace("{category}",e.category||"N/A").replace("{phone}",e.phone||"N/A").replace("{address}",e.address||"N/A").replace("{website}",e.website||"N/A");try{const o=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${i}`},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:"Você é um especialista em auditoria de Google Meu Negócio. Responda SEMPRE em formato JSON válido, sem markdown ou texto adicional."},{role:"user",content:n}],temperature:.7,max_tokens:1500})});if(!o.ok){const d=await o.json().catch(()=>({}));throw new Error(`OpenAI API error: ${o.status} - ${JSON.stringify(d)}`)}const t=(r=(s=(await o.json()).choices[0])==null?void 0:s.message)==null?void 0:r.content;if(!t)throw new Error("No content received from OpenAI");let a=t.trim();a.startsWith("```json")?a=a.replace(/```json\n?/g,"").replace(/```\n?$/g,""):a.startsWith("```")&&(a=a.replace(/```\n?/g,""));const c=JSON.parse(a);return{...e,...c}}catch(o){throw console.error(`Error auditing ${e.company_name}:`,o),o}}export{u as auditSingleCompany};
