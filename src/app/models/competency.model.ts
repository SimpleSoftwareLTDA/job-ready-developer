// ============================================================
// MODELO DE DADOS
// ============================================================

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'docs';
  language: 'pt' | 'en';
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  resources: Resource[];
  children?: Competency[];
  value?: number; // peso visual no D3
  requiresIds?: string[]; // IDs de pré-requisitos
}

export interface UserProgress {
  uid: string;
  completedIds: string[];
  lastUpdated: Date;
}

// ============================================================
// MAPA DE CONHECIMENTO — DADOS PADRÃO
// Estrutura baseada em "Círculos de Competência" (Charlie Munger)
// ============================================================
export const DEFAULT_COMPETENCY_MAP: Competency = {
  id: 'root',
  name: 'Job Ready Developer',
  description: 'O universo completo de conhecimentos para se tornar um desenvolvedor backend pronto para o mercado',
  color: '#0f172a',
  icon: '🚀',
  resources: [],
  children: [
    {
      id: 'cs-fundamentals',
      name: 'Fundamentos CS',
      description: 'A base de toda a ciência da computação',
      color: '#1e3a5f',
      icon: '🧠',
      resources: [
        { title: 'CS50 - Harvard', url: 'https://www.youtube.com/playlist?list=PLhQjrBD2T382eX9-tF75Wa4lTC9v1_OM9', type: 'course', language: 'pt' }
      ],
      children: [
        { id: 'algorithms', name: 'Algoritmos', description: 'Ordenação, busca, estruturas de dados', color: '#1e40af', icon: '⚡', value: 3, requiresIds: ['logic'], resources: [] },
        { id: 'logic', name: 'Lógica', description: 'Lógica booleana e matemática discreta', color: '#1d4ed8', icon: '∑', value: 2, resources: [] },
        { id: 'binary', name: 'Sistemas Numéricos', description: 'Binário, hexadecimal', color: '#2563eb', icon: '01', value: 1, resources: [] }
      ]
    },
    {
      id: 'networking',
      name: 'Redes & APIs',
      description: 'Como os sistemas se comunicam',
      color: '#064e3b',
      icon: '🌐',
      resources: [],
      children: [
        { id: 'tcp-ip', name: 'Protocolos', description: 'TCP/IP, DNS, Infra', color: '#065f46', icon: '📡', value: 3, resources: [] },
        { id: 'http-rest', name: 'HTTP & REST', description: 'Verbos, Status Codes, JSON payloads', color: '#047857', icon: '🔗', value: 4, requiresIds: ['tcp-ip'], resources: [] },
        { id: 'api-tools', name: 'API Client', description: 'Insomnia, Postman', color: '#059669', icon: '🚀', value: 2, requiresIds: ['http-rest'], resources: [] }
      ]
    },
    {
      id: 'databases',
      name: 'Banco de Dados',
      description: 'Armazenamento e modelagem',
      color: '#4a1d96',
      icon: '🗄️',
      resources: [],
      children: [
        {
          id: 'sql-relational',
          name: 'Relacional (SQL)',
          description: 'PostgreSQL, MySQL, SQL Server',
          color: '#5b21b6',
          icon: '📊',
          value: 4,
          children: [
            { id: 'postgres', name: 'PostgreSQL', description: 'O padrão do curso', color: '#7c3aed', icon: '🐘', value: 4, resources: [] },
            { id: 'other-sql', name: 'Outros (Oracle, SQL Server)', description: 'MariaDB, MySQL', color: '#8b5cf6', icon: '📁', value: 2, resources: [] }
          ],
          resources: []
        },
        { id: 'nosql', name: 'NoSQL', description: 'MongoDB, Redis, Firestore', color: '#6d28d9', icon: '📦', value: 2, resources: [] }
      ]
    },
    {
      id: 'devops-infra',
      name: 'DevOps & OS',
      description: 'Infraestrutura e automação',
      color: '#7c2d12',
      icon: '🐧',
      resources: [],
      children: [
        { id: 'linux-basics', name: 'Linux Essencial', description: 'Terminal, SSH, VIM', color: '#9a3412', icon: '💻', value: 3, resources: [] },
        { id: 'docker', name: 'Docker', description: 'Containers e Imagens', color: '#b45309', icon: '🐳', value: 4, requiresIds: ['linux-basics'], resources: [] },
        { id: 'version-control', name: 'Git / GitHub', description: 'Versionamento essencial', color: '#d97706', icon: '🌿', value: 4, resources: [] },
        {
          id: 'observability',
          name: 'Observabilidade',
          description: 'Monitoramento e métricas',
          color: '#ea580c',
          icon: '📈',
          value: 2,
          children: [
            { id: 'grafana', name: 'Grafana & Prometheus', description: 'Métricas e Dashboards', color: '#f97316', icon: '📊', value: 2, requiresIds: ['docker'], resources: [] },
            { id: 'opentelemetry', name: 'OpenTelemetry', description: 'Tracing distribuído', color: '#fb923c', icon: '🔭', value: 1, requiresIds: ['docker'], resources: [] }
          ],
          resources: []
        }
      ]
    },
    {
      id: 'backend-hub',
      name: 'Expertise Backend',
      description: 'O coração do desenvolvimento (Java Focus)',
      color: '#14532d',
      icon: '⚙️',
      resources: [],
      children: [
        {
          id: 'java-ecosystem',
          name: 'Java & Spring',
          description: 'A base principal do treinamento',
          color: '#166534',
          icon: '♨️',
          value: 5,
          children: [
            { id: 'spring-boot', name: 'Spring Boot', description: 'O framework líder', color: '#15803d', icon: '🍃', value: 5, requiresIds: ['http-rest'], resources: [] },
            { id: 'spring-data', name: 'Data JPA', description: 'Persistência de dados', color: '#16a34a', icon: '💾', value: 4, requiresIds: ['spring-boot', 'postgres'], resources: [] },
            { id: 'spring-security', name: 'Security & JWT', description: 'Autenticação e Tokens', color: '#22c55e', icon: '🔒', value: 4, requiresIds: ['spring-boot'], resources: [] },
            { id: 'kotlin', name: 'Kotlin', description: 'Interoperabilidade moderna', color: '#4ade80', icon: '🎯', value: 3, requiresIds: ['spring-boot'], resources: [] }
          ],
          resources: []
        },
        {
          id: 'build-tools',
          name: 'Gerenciadores',
          description: 'Maven e Gradle',
          color: '#064e3b',
          icon: '📦',
          value: 2,
          resources: []
        },
        {
          id: 'other-languages',
          name: 'Outras Linguagens',
          description: 'Python, Go, C#, PHP',
          color: '#065f46',
          icon: '🗣️',
          value: 2,
          resources: []
        },
        {
          id: 'backend-patterns',
          name: 'Padrões & Frameworks',
          description: 'Swagger, GraphQL, gRPC, Quarkus',
          color: '#059669',
          icon: '🧩',
          value: 2,
          resources: []
        }
      ]
    },
    {
      id: 'frontend-basics',
      name: 'Frontend Support',
      description: 'Interfaces e comunicação',
      color: '#831843',
      icon: '🎨',
      resources: [],
      children: [
        { id: 'web-fundamentals', name: 'HTML, CSS & JS', description: 'A base da web', color: '#9d174d', icon: '🌐', value: 3, resources: [] },
        { id: 'react-next', name: 'React & Next.js', description: 'Frameworks modernos', color: '#be123c', icon: '⚛️', value: 3, resources: [] },
        { id: 'typescript', name: 'TypeScript', description: 'Tipagem para JS', color: '#e11d48', icon: 'TS', value: 2, resources: [] }
      ]
    },
    {
      id: 'cloud-hosting',
      name: 'Cloud & Cloudflare',
      description: 'Onde o software vive',
      color: '#1e3a8a',
      icon: '☁️',
      resources: [],
      children: [
        { id: 'aws-cloud', name: 'AWS & GCP', description: 'Infra principal', color: '#1e40af', icon: '🟠', value: 3, resources: [] },
        { id: 'k8s', name: 'Kubernetes', description: 'Orquestração complexa', color: '#1d4ed8', icon: '☸️', value: 2, requiresIds: ['docker'], resources: [] },
        { id: 'hosting-automation', name: 'Vercel & N8N', description: 'Hospedagem e Automação', color: '#2563eb', icon: '🚀', value: 2, requiresIds: ['version-control'], resources: [] }
      ]
    },
    {
      id: 'professional-env',
      name: 'Ambiente & Softwares',
      description: 'Produtividade e Gestão Ágil',
      color: '#334155',
      icon: '🛠️',
      resources: [],
      children: [
        { id: 'intellij', name: 'IntelliJ IDEA', description: 'IDE principal', color: '#475569', icon: '💎', value: 3, resources: [] },
        { id: 'agile-management', name: 'Jira & Trello', description: 'Kanban e Gestão Agil', color: '#64748b', icon: '📋', value: 2, resources: [] }
      ]
    }
  ]
};
