import type { Joke } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useCatch, useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';

type LoaderData = { randomJoke: Joke };

export const loader: LoaderFunction = async () => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomRowNumber,
  });
  if (!randomJoke) {
    throw new Response('No random jokefound', { status: 404 });
  }
  const data: LoaderData = { randomJoke };
  return json(data);
};

const JokesIndexRoute = function JokesIndexRoute(): JSX.Element {
  const {
    randomJoke: { content, id, name },
  } = useLoaderData<LoaderData>();

  // throw new Error('Testing Error Boundary');

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{content}</p>
      <Link to={id} prefetch="intent">
        "{name}" Permalink
      </Link>
    </div>
  );
};

export function CatchBoundary() {
  const { status } = useCatch();

  if (status === 404) {
    return <div className="error-container">There are no jokes to display.</div>;
  }
  throw new Error(`Unexpectedcaught response with status: ${status}`);
}

const ErrorBoundary = function ErrorBoundary() {
  return <div className="error-container">I messed up!</div>;
};

export { JokesIndexRoute as default, ErrorBoundary };
