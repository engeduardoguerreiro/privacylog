export type RulesPage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export const rulesPages: RulesPage[] = [
  {
    slug: "regras-gerais",
    title: "Regras gerais da comunidade",
    eyebrow: "Conduta",
    description:
      "Diretrizes para manter o fórum organizado, discreto e útil para adultos que buscam informações com responsabilidade.",
    sections: [
      {
        title: "Respeito entre usuários",
        body: "Discussões devem ser objetivas e civilizadas. Ataques pessoais, perseguição, exposição de terceiros, ameaças e linguagem discriminatória não fazem parte da comunidade.",
      },
      {
        title: "Relatos com responsabilidade",
        body: "Publique experiências próprias, com contexto suficiente e sem transformar relato em acusação sem base. Informações sensíveis ou privadas devem ficar fora do fórum.",
      },
      {
        title: "Organização por categoria",
        body: "Use a categoria correta por estado, tipo de local ou aviso geral. Tópicos duplicados, spam e publicações fora de contexto podem ser movidos ou removidos.",
      },
    ],
  },
  {
    slug: "maioridade-conteudo-proibido",
    title: "Maioridade e conteúdo proibido",
    eyebrow: "18+",
    description:
      "Política central do PrivacyLog: o site é exclusivamente para maiores de 18 anos e tem tolerância zero com qualquer conteúdo envolvendo menores.",
    sections: [
      {
        title: "Acesso proibido para menores",
        body: "O PrivacyLog é destinado apenas a adultos. Qualquer pessoa menor de 18 anos deve sair imediatamente do site e não pode criar conta, postar ou interagir no fórum.",
      },
      {
        title: "Tolerância zero",
        body: "É proibido publicar, solicitar, insinuar, promover ou compartilhar qualquer conteúdo que envolva menores de idade, exploração, abuso, coerção ou atividade ilegal.",
      },
      {
        title: "Remoção e denúncia",
        body: "Conteúdos proibidos devem ser removidos quando identificados. Usuários podem denunciar publicações suspeitas para análise e bloqueio quando necessário.",
      },
    ],
  },
  {
    slug: "privacidade-seguranca",
    title: "Privacidade e segurança",
    eyebrow: "Discrição",
    description:
      "Boas práticas para preservar identidade, dados pessoais e segurança de usuários, locais, profissionais e anunciantes.",
    sections: [
      {
        title: "Não exponha dados pessoais",
        body: "Não publique e-mail, documento, endereço residencial, fotos privadas, conversas pessoais, dados bancários ou qualquer informação que identifique alguém sem consentimento.",
      },
      {
        title: "Use nickname",
        body: "As postagens devem usar nickname. O e-mail do usuário não deve aparecer publicamente, e relatos devem evitar detalhes que revelem identidade real.",
      },
      {
        title: "Cuidado com golpes",
        body: "Desconfie de links externos, pedidos de pagamento antecipado, perfis sem histórico e mensagens que tentem tirar a conversa da plataforma de forma suspeita.",
      },
    ],
  },
  {
    slug: "denuncias-moderacao",
    title: "Denúncias e moderação",
    eyebrow: "Comunidade",
    description:
      "Como agir diante de conteúdo irregular, spam, golpe, exposição indevida ou comportamento que coloque a comunidade em risco.",
    sections: [
      {
        title: "Quando denunciar",
        body: "Denuncie publicações com dados pessoais, conteúdo ilegal, suspeita envolvendo menores, ameaça, golpe, spam, extorsão ou manipulação de avaliações.",
      },
      {
        title: "Como descrever o problema",
        body: "Informe o link do tópico, explique o motivo e mantenha a descrição objetiva. Quanto mais claro o contexto, mais rápida tende a ser a análise.",
      },
      {
        title: "Medidas possíveis",
        body: "A moderação pode ocultar conteúdo, trancar tópicos, remover publicações, bloquear usuários e ajustar categorias para preservar a segurança do fórum.",
      },
    ],
  },
  {
    slug: "anunciantes-parcerias",
    title: "Anunciantes e parcerias",
    eyebrow: "Premium",
    description:
      "Orientações para clínicas, casas, anunciantes e parceiros que desejam aparecer no PrivacyLog de forma premium e organizada.",
    sections: [
      {
        title: "Destaque premium",
        body: "Anunciantes premium podem ganhar prioridade visual no mapa, banners selecionados e apresentação mais forte nas páginas públicas.",
      },
      {
        title: "Informações corretas",
        body: "Nome, endereço, contato, horários, site e preços precisam ser claros. Informações incorretas prejudicam confiança e podem ser corrigidas pela administração.",
      },
      {
        title: "Contato comercial",
        body: "Parcerias, anúncios e campanhas especiais devem ser tratados pelo canal oficial contato@privacylog.com.br.",
      },
    ],
  },
];

export function getRulesPage(slug: string) {
  return rulesPages.find((page) => page.slug === slug) || null;
}
