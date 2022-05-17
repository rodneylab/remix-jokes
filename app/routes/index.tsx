import type { LinksFunction, MetaFunction } from '@remix-run/node';
import stylesUrl from '~/styles/index.css';

const links: LinksFunction = () => [{ rel: 'stylesheet', href: stylesUrl }];

const meta: MetaFunction = () => ({
  title: "Remix: So great, it's funny!",
  description: 'Remix jokes app. Learn Remix and laugh at the same time!',
});

const IndexRoute = function IndexRoute(): JSX.Element {
  return <>Hello index route</>;
};

export { IndexRoute as default, links, meta };
