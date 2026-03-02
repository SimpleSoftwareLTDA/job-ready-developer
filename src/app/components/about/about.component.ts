import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="about-container">
      <header class="about-hero">
        <div class="profile-card">
          <div class="avatar-wrapper">
            <img src="https://raw.githubusercontent.com/SimpleSoftwareLTDA/treinamento-descomplica-dev-na-gringa/refs/heads/master/img/mentor/robson-cassiano-mentor.jpg" alt="Robson Cassiano" class="profile-img">
          </div>
          <h1>Robson Cassiano</h1>
          <p class="subtitle">Senior Software Engineer & Mentor de Carreira Internacional</p>
          <div class="munger-badge-mini">INTJ-A | Poliglota | Filósofo</div>
        </div>
      </header>

      <section class="content-section">
        <div class="content-grid">
          <div class="bio-text">
            <h2>Construindo o futuro sobre os ombros de gigantes</h2>
            <p>Robson Cassiano é Senior Software Engineer especializado em Java Backend, mentor de carreiras internacionais e empresário fundador da <strong>Simple Software</strong>.</p>
            
            <p>Com uma trajetória que une a excelência técnica da engenharia de software à profundidade da filosofia clássica, Robson atua na intersecção entre o código de alta performance e o desenvolvimento humano. "Nem só de código vive o DEV" é o lema que guia sua mentoria, focada em levar programadores brasileiros ao mercado global, ultrapassando a barreira dos 30k de renda mensal.</p>

            <h3>Por que este mapa?</h3>
            <p>O <strong>Job Ready Developer</strong> nasceu do conceito de <em>Círculos de Competência</em>. Em um mercado saturado de informações, este mapa serve como um guia geoestratégico para sua evolução. Começamos pelo núcleo — a lógica e os fundamentos — e expandimos para o ecossistema Java/Spring e Cloud, garantindo que você construa uma base inabalável antes de escalar.</p>
            
            <h3>Minha Filosofia</h3>
            <ul>
              <li><strong>Pragmatismo & Lucratividade:</strong> Soluções robustas que geram valor real.</li>
              <li><strong>Mentalidade Global:</strong> Domínio do inglês e posicionamento estratégico.</li>
              <li><strong>Fundamentos Imutáveis:</strong> A tecnologia muda, a ciência da computação é eterna.</li>
            </ul>
          </div>

          <div class="social-side">
            <div class="card">
              <h3>Siga a Jornada</h3>
              <div class="links">
                <a href="https://eu.robsoncassiano.software/" target="_blank" class="link-item">🌐 Site Oficial</a>
                <a href="https://www.linkedin.com/in/robsoncassiano-software/" target="_blank" class="link-item">🔗 LinkedIn</a>
                <a href="https://github.com/randintn" target="_blank" class="link-item">💻 GitHub</a>
                <a href="https://www.youtube.com/@RobsonCassianoSoftware" target="_blank" class="link-item">📺 YouTube</a>
              </div>
            </div>
            
            <div class="card gold">
              <h3>Círculo de Elite</h3>
              <p>Este mapa é uma ferramenta de apoio para a mentoria. Se você busca o próximo nível na carreira internacional, o caminho começa aqui.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-container {
      min-height: calc(100vh - 64px);
      background: var(--bg);
    }
    .about-hero {
      padding: 5rem 2rem 4rem;
      background: radial-gradient(circle at center, rgba(132, 204, 22, 0.1) 0%, transparent 70%);
      display: flex;
      justify-content: center;
      text-align: center;
    }
    .profile-card {
      max-width: 700px;
    }
    .avatar-wrapper {
      width: 160px;
      height: 160px;
      margin: 0 auto 2rem;
      border-radius: 50%;
      padding: 5px;
      background: var(--gradient);
      box-shadow: 0 10px 40px rgba(132, 204, 22, 0.2);
    }
    .profile-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--bg);
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      font-family: 'Inter', sans-serif;
      font-weight: 800;
    }
    .subtitle {
      color: var(--accent);
      font-weight: 700;
      letter-spacing: 0.05em;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
    .munger-badge-mini {
      display: inline-block;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      padding: 0.4rem 1rem;
      border-radius: 999px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .content-section {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 2rem 6rem;
    }
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 4rem;
    }
    @media (max-width: 850px) {
      .content-grid { grid-template-columns: 1fr; }
    }
    .bio-text h2 { margin-bottom: 1.5rem; font-size: 2rem; font-family: 'Inter', sans-serif; font-weight: 700; }
    .bio-text p {
      color: var(--text-secondary);
      line-height: 1.8;
      font-size: 1.15rem;
      margin-bottom: 1.5rem;
    }
    .bio-text h3 { margin-top: 2.5rem; margin-bottom: 1rem; color: var(--text-primary); font-size: 1.4rem; }
    .bio-text ul { list-style: none; padding: 0; }
    .bio-text li {
      margin-bottom: 1.25rem;
      padding-left: 2rem;
      position: relative;
      font-size: 1.1rem;
      color: var(--text-secondary);
    }
    .bio-text li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: var(--accent);
      font-weight: 800;
    }
    .card {
      background: var(--nav-bg);
      border: 1px solid var(--border);
      padding: 2rem;
      border-radius: 24px;
      margin-bottom: 2rem;
      backdrop-filter: blur(10px);
    }
    .card.gold {
      border-color: var(--accent-gold);
      background: rgba(250, 190, 20, 0.03);
    }
    .card h3 { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 1.5rem; letter-spacing: 0.1em; font-weight: 800; }
    .links { display: flex; flex-direction: column; gap: 1rem; }
    .link-item {
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s;
      padding: 0.5rem;
      margin: -0.5rem;
      border-radius: 8px;
    }
    .link-item:hover { background: rgba(132, 204, 22, 0.1); color: var(--accent); transform: translateX(5px); }
  `]
})
export class AboutComponent { }
