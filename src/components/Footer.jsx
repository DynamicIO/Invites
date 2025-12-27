import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <span className="footer-text">Powered by </span>
      <a 
          href="https://www.dynamicio.net" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link"
      >
        Dynamic.IO
      </a>
    </footer>
  );
}

export default Footer;

