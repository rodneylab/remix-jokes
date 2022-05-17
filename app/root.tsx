import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, useCatch } from '@remix-run/react';
import globalLargeStylesUrl from './styles/global-large.css';
import globalMediumStylesUrl from './styles/global-medium.css';
import globalStylesUrl from './styles/global.css';

const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: globalStylesUrl,
    },
    {
      rel: 'stylesheet',
      href: globalMediumStylesUrl,
      media: 'print, (min-width: 640px)',
    },
    {
      rel: 'stylesheet',
      href: globalLargeStylesUrl,
      media: 'screen and (min-width: 1024px)',
    },
  ];
};

const meta: MetaFunction = () => {
  const description = `LearnRemix and laugh at the same time!`;

  return {
    charset: 'utf-8',
    description,
    keywords: 'Remix,jokes',
    'twitter:image': 'https://remix-jokes.lol/social.png',
    'twitter:card': 'summary_large_image',
    'twitter:creator': '@remix_run',
    'twitter:site': '@remix_run',
    'twitter:title': 'Remix Jokes',
    'twitter:description': description,
  };
};

function Document({
  children,
  title = 'Remix jokes',
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en-GB">
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

const App = function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
};

function CatchBoundary() {
  const { status, statusText } = useCatch();

  return (
    <Document title={`${status} ${statusText}`}>
      <div className="error-container">
        <h1>
          {status} {statusText}
        </h1>
      </div>
    </Document>
  );
}

function ErrorBoundary({ error }: { error: Error }) {
  const { message } = error;

  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{message}</pre>
      </div>
    </Document>
  );
}

export { App as default, CatchBoundary, ErrorBoundary, links, meta };
