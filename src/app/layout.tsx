import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '../components/Layout/ClientLayout'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tigr Shop - Интернет-магазин обуви',
  description: 'Широкий ассортимент оригинальных брендов обуви, одежды и аксессуаров',
  icons: {
    icon: [
      // Светлая тема
      {
        url: '/Favicon/favicon-light-16.svg',
        sizes: '16x16',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Favicon/favicon-light-32.svg',
        sizes: '32x32',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      // Тёмная тема
      {
        url: '/Favicon/favicon-dark-16.svg',
        sizes: '16x16',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/Favicon/favicon-dark-32.svg',
        sizes: '32x32',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    // Для Apple устройств (используем 32px версию)
    apple: [
      {
        url: '/Favicon/favicon-light-32.svg',
        sizes: '180x180',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Favicon/favicon-dark-32.svg',
        sizes: '180x180',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-black`} suppressHydrationWarning>
        {/* Яндекс.Метрика */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
        >
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(103400831, "init", {
                 clickmap:true,
                 trackLinks:true,
                 accurateTrackBounce:true,
                 webvisor:true,
                 ecommerce:"dataLayer"
            });
          `}
        </Script>
        
        <ClientLayout>
          {children}
        </ClientLayout>
        
        {/* Noscript для Яндекс.Метрики */}
        <noscript>
          <div>
            <img 
              src="https://mc.yandex.ru/watch/103400831" 
              style={{position:'absolute', left:'-9999px'}} 
              alt="" 
            />
          </div>
        </noscript>
      </body>
    </html>
  )
}