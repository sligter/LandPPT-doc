import React, {useEffect, useState} from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

const htmlPath = '/landppt_full.html';

export default function Home() {
  const [pageHtml, setPageHtml] = useState(null);
  useEffect(() => {
    let aborted = false;

    const loadAndInject = async () => {
      try {
        const res = await fetch(htmlPath);
        const text = await res.text();
        if (aborted) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // Inject head nodes (styles, scripts, metas) if not present.
        // Process nodes sequentially and wait for external scripts to load so inline scripts
        // that depend on them (e.g. `tailwind`) won't run too early.
        const existingScripts = Array.from(document.querySelectorAll('script')).map(s => s.src).filter(Boolean);
        const existingLinks = Array.from(document.querySelectorAll('link')).map(l => l.href).filter(Boolean);

        const headNodes = Array.from(doc.head.children);
        for (const node of headNodes) {
          try {
            const tag = node.tagName;
            if (tag === 'SCRIPT') {
              const src = node.getAttribute('src');
              if (src) {
                if (!existingScripts.includes(src)) {
                  // Append external script and wait for it to load before continuing
                  await new Promise((resolve) => {
                    const s = document.createElement('script');
                    // preserve async/defer attributes if explicitly present
                    if (node.hasAttribute('async')) s.async = true;
                    else s.async = false; // ensure ordered execution
                    if (node.hasAttribute('defer')) s.defer = true;
                    s.src = src;
                    s.onload = () => resolve();
                    s.onerror = () => resolve();
                    document.head.appendChild(s);
                  });
                }
              } else {
                // inline script - append and it will execute immediately
                const s = document.createElement('script');
                s.text = node.textContent || '';
                document.head.appendChild(s);
              }
            } else if (tag === 'LINK') {
              const href = node.getAttribute('href');
              if (href && !existingLinks.includes(href)) {
                const l = document.createElement('link');
                Array.from(node.attributes).forEach(attr => l.setAttribute(attr.name, attr.value));
                document.head.appendChild(l);
              }
            } else {
              // meta, title, style, etc. Append clone immediately.
              const clone = node.cloneNode(true);
              document.head.appendChild(clone);
            }
          } catch (e) {
            // ignore single node errors
          }
        }

        // Set body HTML
        setPageHtml(doc.body.innerHTML);

        // Load AOS JS library (CSS already loaded via <link>)
        if (!window.AOS) {
          const aosScript = document.createElement('script');
          aosScript.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
          aosScript.async = false;
          aosScript.onload = () => {
            // Initialize AOS once script loads
            if (window.AOS && typeof window.AOS.init === 'function') {
              window.AOS.init({ once: true, offset: 50, duration: 800 });
            }
          };
          document.head.appendChild(aosScript);
        } else {
          // AOS already loaded, init immediately
          if (typeof window.AOS.init === 'function') {
            window.AOS.init({ once: true, offset: 50, duration: 800 });
          }
        }
      } catch (err) {
        // fetch/parse error
        console.error('Failed to load HTML:', err);
      }
    };

    loadAndInject();

    // Scroll handler: toggle nav styles based on scroll position
    const handleScroll = () => {
      const nav = document.getElementById('site-nav');
      if (!nav) return;
      if (window.pageYOffset > 20) {
        nav.classList.add('bg-dark-bg/90', 'backdrop-blur-md', 'border-b', 'border-dark-border');
      } else {
        nav.classList.remove('bg-dark-bg/90', 'backdrop-blur-md', 'border-b', 'border-dark-border');
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount to set initial state

    // Mobile menu toggle handler (delegation: capture clicks on [data-mobile-btn])
    const handleMobileMenuClick = (e) => {
      const btn = e.target.closest('[data-mobile-btn]');
      if (!btn) return;

      const mobileMenu = document.querySelector('[data-mobile-menu]');
      const iconOpen = btn.querySelector('[data-icon-open]');
      const iconClose = btn.querySelector('[data-icon-close]');

      if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
      }
      if (iconOpen) {
        iconOpen.classList.toggle('hidden');
      }
      if (iconClose) {
        iconClose.classList.toggle('hidden');
      }
    };
    document.addEventListener('click', handleMobileMenuClick);

    return () => {
      aborted = true;
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleMobileMenuClick);
    };
  }, []);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>LandPPT - AI驱动的智能演示文稿生成平台</title>
        <meta name="description" content="基于大语言模型（LLM）的智能PPT生成平台，一键将文档转换为专业演示文稿。支持GPT-4o, Claude, Gemini等多种模型。" />

        {/* keep minimal head; other resources are injected from static HTML */}
      </Head>

      <Layout>
        <main>
          <div dangerouslySetInnerHTML={{ __html: pageHtml || '<div/>' }} />
        </main>
      </Layout>
    </>
  );
}
