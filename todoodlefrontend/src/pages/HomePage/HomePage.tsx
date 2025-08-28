import { useNavigate } from 'react-router-dom';
import '../../styles/globals.css'
import '../../styles/utilities.css'
import './HomePage.css'
import NavBar from '../../components/NavBar/NavBar'
import todoodleImage from '../../assets/todoodle_image_no_bg.png'

const HomePage = () => {
  const navigate = useNavigate();

  const startTypewriter = (element: HTMLHeadingElement | null) => {
    if (!element) return;

    const texts = [
      { text: 'Todo', color: 'var(--color-error)' },
      { text: 'In progress', color: 'var(--color-highlight)' },
      { text: 'Done', color: 'var(--color-primary)' }
    ];
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;

    const typeEffect = () => {
      const currentItem = texts[currentTextIndex];
      const currentText = currentItem.text;

      // Update color for current text
      element.style.color = currentItem.color;

      if (isDeleting) {
        element.textContent = currentText.substring(0, currentCharIndex - 1) + '|';
        currentCharIndex--;
      } else {
        element.textContent = currentText.substring(0, currentCharIndex + 1) + '|';
        currentCharIndex++;
      }

      let typeSpeed = isDeleting ? 80 : 125;

      if (!isDeleting && currentCharIndex === currentText.length) {
        typeSpeed = 1500; // Pause at end
        isDeleting = true;
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        typeSpeed = 300; // Pause before next text
      }

      setTimeout(typeEffect, typeSpeed);
    };

    typeEffect();
  };

  return (
    <>
      <NavBar></NavBar>
      <div className="home-page">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Write it down!</h1>
            <h2 ref={startTypewriter} className="typewriter-text"></h2>
            <p className="hero-subtitle">"Transform scattered thoughts into organized action"</p>
            <div className="hero-buttons">
              <button className="btn-secondary" onClick={() => navigate('/sign_up')}>Get Started</button>
              <button className="btn-secondary" onClick={() => navigate('/about')}>Learn More</button>
              </div>
          </div>
          <img src={todoodleImage} alt="Todoodle Logo" className="hero-logo" />
        </div>
        <div className="hero-footer">
          <p className="text-muted">"Join two friends in a wacky journey to discover clarity"</p>
        </div>
      </div>
    </>
  )
}

export default HomePage