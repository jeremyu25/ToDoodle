import React from 'react'
import '../styles/globals.css'
import './Page.css'
import NavBar from '../components/NavBar/NavBar'
import todoodleImage from '../assets/todoodle_image_no_bg.png'

const HomePage = () => {
  const startTypewriter = (element: HTMLHeadingElement | null) => {
    if (!element) return;

    const texts = ['Todo', 'In progress', 'Done'];
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;

    const typeEffect = () => {
      const currentText = texts[currentTextIndex];

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
      <div className="homePage">
        <div className="hero-section">
          <div>
            <h1>Write it down!</h1>
            <h2 ref={startTypewriter}></h2>
          </div>
          <img src={todoodleImage} alt="Todoodle Logo" style={{ width: '400px', height: 'auto' }} />
        </div>
        <p>This is just a fun small hobby between two developers with too much time on their hands.</p>
        <p>We want to create a todo list application to keep our skills fresh but at the same time tune it to the needs of our users.</p>
        <p>Feel free to give it a try. Who knows, you might just like it!</p>
      </div>
    </>
  )
}

export default HomePage