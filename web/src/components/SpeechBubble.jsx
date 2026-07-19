import { useEffect, useState } from 'react';
import styles from './SpeechBubble.module.css';

export default function SpeechBubble({ text = '', typing = true }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!typing) { setDisplayed(text); return; }
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, ++i)); }
      else clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text, typing]);

  return (
    <div className={styles.bubble}>
      <span>{displayed}</span>
      {typing && displayed.length < text.length && (
        <span className={styles.cursor}>|</span>
      )}
    </div>
  );
}
