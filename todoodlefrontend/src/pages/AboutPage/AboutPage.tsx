import { useNavigate } from 'react-router-dom'
import '../../styles/globals.css'
import '../Page.css'
import NavBar from '../../components/NavBar/NavBar'
import todoodleImage from '../../assets/serene_lady_writing_todo_list.png'

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <NavBar></NavBar>
      <div className="about-page">
        <section className="about-hero">
          <div className="about-hero-content">
            <h1>Our Story</h1>
            <p className="about-hero-subtitle">A tale of two developers with too much time and boredom on their hands.</p>
          </div>
          <img src={todoodleImage} alt="Todoodle Logo" className="about-hero-logo" />
        </section>
        <section className="about-content-section">
          <div className="content-grid">
            <div className="content-card">
              <div className="content-icon">💡</div>
              <h3>The Idea</h3>
              <p>This is just a fun small hobby between two developers to inspire ourselves to action.</p>
            </div>
            <div className="content-card">
              <div className="content-icon">🎯</div>
              <h3>The Mission</h3>
              <p>We want to create a todo list application to keep our skills fresh but at the same time tune it to the needs of our users.</p>
            </div>
            <div className="content-card">
              <div className="content-icon">🚀</div>
              <h3>The Journey</h3>
              <p>Built with passion, powered by creativity, and designed for simplicity. We're learning as we go!</p>
            </div>
          </div>
        </section>
        <section className="about-content-section">
          <h2>Why ToDoodle?</h2>
          <div className="content-grid">
            <div className="content-card">
              <div className="content-icon">📝</div>
              <h4>Simple & Clean</h4>
              <p>No clutter, no confusion. Just your thoughts organized beautifully.</p>
            </div>
            <div className="content-card">
              <div className="content-icon">🎨</div>
              <h4>Thoughtful Design</h4>
              <p>Warm colors and smooth interactions that make organizing actually enjoyable.</p>
            </div>
            <div className="content-card">
              <div className="content-icon">💝</div>
              <h4>Made with Care</h4>
              <p>Every feature is crafted with attention to detail and user experience in mind.</p>
            </div>
          </div>
        </section>
        <section className="about-cta">
          <div className="cta-content">
            <h2>Ready to Get Organized?</h2>
            <p style={{textAlign: 'center'}}>Feel free to give it a try. Who knows, you might just like it!</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate('/sign_up')}>Get Started</button>
              <button className="btn-secondary" onClick={() => navigate('/feedback')}>Share Feedback</button>
            </div>
          </div>
        </section>
        <section className="about-tech">
          <h3>Built With</h3>
          <div className="tech-stack">
            <div className="tech-item" onClick={() => window.open("https://reactjs.org/", "_blank")}>
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" className="tech-logo" />
              <span>React</span>
            </div>
            <div className="tech-item" onClick={() => window.open("https://nodejs.org/", "_blank")}>
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" className="tech-logo" />
              <span>Node.js</span>
            </div>
            <div className="tech-item" onClick={() => window.open("https://expressjs.com/", "_blank")}>
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" alt="ExpressJS" className="tech-logo" />
              <span>ExpressJS</span>
            </div>
            <div className="tech-item" onClick={() => window.open("https://postgresql.org/", "_blank")}>
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" className="tech-logo" />
              <span>Postgres</span>
            </div>
            <div className="tech-item" onClick={() => window.open("https://vitejs.dev/", "_blank")}>
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" alt="Vite" className="tech-logo" />
              <span>Vite</span>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default AboutPage