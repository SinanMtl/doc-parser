import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const App = () => {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState(i18n.language);
  const availableLanguages = ['en', 'tr']; // Add your available languages here

  const userMessage = 'Hello World!';
  const userMessageAR = 'مرحبا بالعالم!';
  const userMessageJP = 'こんにちは世界!';
  const userMessageHB = 'שלום עולם!';
  const userMessageKR = '안녕하세요 세계!';

  const messages = {
    // İngilizce
    english: "Hello world, welcome to our application",
    
    // Türkçe
    turkish: "Merhaba dünya, uygulamamıza hoş geldiniz",
    
    // Arapça
    arabic: "مرحبا بكم في تطبيقنا",

    hebrew: "שלום עולם",

    // Çince (Basitleştirilmiş)
    chinese: "欢迎使用我们的应用程序",
    
    // Japonca
    japanese: "私たちのアプリケーションへようこそ",
    
    // Rusça
    russian: "Добро пожаловать в наше приложение",
    
    // Hintçe (Devanagari)
    hindi: "हमारे एप्लिकेशन में आपका स्वागत है",
    
    // İspanyolca
    spanish: "Bienvenido a nuestra aplicación",
    
    // Fransızca
    french: "Bienvenue dans notre application",
    
    // Technical strings (filtrelenmeli)
    apiUrl: "https://api.example.com/users",
    className: "btn-primary",
    functionName: "handleUserClick",
    
    // Kod benzeri (filtrelenmeli)
    constant: "API_KEY_123",
    short: "OK"
  };

  const translationPattern = /(?:\$t\(|\.t\(|i18n\.t\()\s*["'`]([^"'`]+)["'`]/g;

  console.log('User Message:', messages, userMessage, userMessageAR, userMessageJP, userMessageHB, userMessageKR);
  
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Locale changed to:', locale);
    };
    handleLanguageChange();
  }, [locale]);

  const handleLanguageChange = (e) => {
    const newLocale = e.target.value;
    setLocale(newLocale);
    i18n.changeLanguage(newLocale);
  };

  const templateLiteralText = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Vivamus lacinia odio vitae vestibulum.
  `;

  function sayHello(page, param2) {
    console.log(page, 'Hello!!!', param2);
    return page;
  }

  sayHello('Home page', 'Second param');

  const attrName = 'data-i18n';

  const attrPattern = new RegExp(
    `\\b${attrName}\\s*=\\s*["']([^"']+)["']`,
    'gi'
  );

  const attrPattern2 = new RegExp(`\\b${attrName}\\s*=\\s*["']([^"']+)["']`, 'gi');

  return (
    <>
      <div className="language-selector">
        <select value={locale} onChange={handleLanguageChange} className="language-dropdown">
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div id="wrapper">
        <section className="intro">
          <header>
            <img className="logo" src="https://teknasyon.com/content/assets/img/logo/teknasyon-logo-white.svg" alt="" />
            <h1>Yerel</h1>
            <p>
              We are a team that thinks big and has big goals. We start each new day with the aim of moving
              ourselves one step forward.
            </p>
            <ul className="actions">
              <li>
                <a href="#first" className="arrow scrolly"><span className="label">Next</span></a>
              </li>
            </ul>
          </header>
          <div className="content">
            <span className="image fill" data-position="center">
              <img src="https://teknasyon.com/content/uploads/pitstop-2024-flatten-1-min-scaled.jpg" alt="" />
            </span>
          </div>
        </section>

        <section id="first">
          <header>
            <h2>What Do We Do?</h2>
          </header>
          <div className="content">
            <p>
              Discover Teknasyon's focus! We develop mobile applications that touch lives and provide solutions to
              needs with strong stories. We are a strategic business partner that enables brands to grow on a
              global scale. Be a part of this story and discover Teknasyon for ventures.
            </p>
          </div>
        </section>

        <section>
          <header>
            <h2>Our Services</h2>
          </header>
          <div className="content">
            <p>
              As Teknasyon, we offer a wide range of services. We aim for excellence in every project.
            </p>

            <section>
              <header>
                <h3>B2C</h3>
                <p>
                  We develop mobile applications that touch lives. By prioritizing user experience, we produce
                  solutions that make life easier for millions of people.
                </p>
              </header>
              <div className="content">
                <div className="gallery">
                  <a href="images/gallery/fulls/01.jpg" className="landscape">
                    <img src="https://teknasyon.com/content/uploads/btb-7-n-1.png" alt="BTB 7 N 1" />
                  </a>
                  <a href="images/gallery/fulls/02.jpg">
                    <img src="https://teknasyon.com/content/uploads/esim-gorsel-1.png" alt="E-Sim Alt text" />
                  </a>
                  <a href="images/gallery/fulls/03.jpg">
                    <img src="https://teknasyon.com/content/uploads/lisa-gorsel-1.png" alt="Lisa Alt text" />
                  </a>
                  <a href="images/gallery/fulls/04.jpg" className="landscape">
                    <img src="https://teknasyon.com/content/uploads/gtc-gorsel.png" alt="GTC Alt text" />
                  </a>
                </div>
              </div>
            </section>

            <section>
              <header>
                <h3>B2B</h3>
                <p>
                  We provide solutions to needs with strong stories. We develop projects that strengthen the
                  technological infrastructure of businesses by supporting them in their digital
                  transformation processes.
                </p>
              </header>
              <div className="content">
                <div className="gallery">
                  <a href="images/gallery/fulls/05.jpg" className="landscape">
                    <img src="https://teknasyon.com/content/uploads/rockads-laptop.png" alt="Rockads Laptop" />
                  </a>
                  <a href="images/gallery/fulls/06.jpg" className="landscape">
                    <img src="https://teknasyon.com/content/uploads/desk-1.png" alt="Desk 1" />
                  </a>
                  <a href="images/gallery/fulls/07.jpg" className="landscape">
                    <img src="https://teknasyon.com/content/uploads/zotlo2x.png" alt="Zotlo 2X" />
                  </a>
                </div>
              </div>
            </section>

          </div>
        </section>
        <section>
          <header>
            <h2>Contact Us</h2>
          </header>
          <div className="content">
            <p>
              As the Teknasyon family, we are happy to communicate with you. Contact us for your projects,
              questions, or collaboration offers.
            </p>
            <form>
              <div className="fields">
                <div className="field half">
                  <input type="text" name="name" id="name" placeholder="Name" />
                </div>
                <div className="field half">
                  <input type="email" name="email" id="email" placeholder="Email" />
                </div>
                <div className="field">
                  <textarea name="message" id="message" placeholder="Your Message" rows="7"></textarea>
                </div>
              </div>
              <ul className="actions">
                <li>
                  <input type="submit" value="Send Message" className="button primary" />
                </li>
              </ul>
            </form>
          </div>
          <footer>
            <ul className="items">
              <li>
                <h3>Phone</h3>
                <a href="#">+90 212 963 15 50</a>
              </li>
              <li>
                <h3>Address</h3>
                <span>Büyükdere Cd. Uso Center Plaza No:245 Floor:7 Maslak - Istanbul</span>
              </li>
            </ul>
          </footer>
        </section>
      </div>
    </>
  );
};

export default App;
