import type { Joke } from '@prisma/client';
import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useCatch, useLoaderData, useParams } from '@remix-run/react';
import JokeDisplay from '~/components/joke';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

type LoaderData = { joke: Joke; isOwner: boolean };

const loader: LoaderFunction = async ({ params, request }) => {
  // throw new Error('Testing Error Boundary');
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response('What a joke! Not found :/', { status: 404 });
  }
  const { jokesterId } = joke;
  const data: LoaderData = { joke, isOwner: userId === jokesterId };
  return json(data);
};

const meta: MetaFunction = ({ data }: { data: LoaderData | undefined }) => {
  if (!data) {
    return {
      title: 'No joke',
      description: 'No joke found',
    };
  }
  const {
    joke: { name },
  } = data;

  return {
    title: `"${name}" joke`,
    description: `Enjoy the "${name}" joke and much more`,
  };
};

const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  if (form.get('_method') !== 'delete') {
    throw new Response(`The _method ${form.get('_method')} is not supported`, { status: 400 });
  }
  const userId = await requireUserId(request);
  const { jokeId: id } = params;
  const joke = await db.joke.findUnique({
    where: { id },
  });
  if (!joke) {
    throw new Response("Can't delete what does not exist!", { status: 404 });
  }
  const { jokesterId } = joke;
  if (jokesterId !== userId) {
    throw new Response("That's not your joke!", { status: 401 });
  }
  await db.joke.delete({ where: { id } });
  return redirect('/jokes');
};

const JokeRoute = function JokeRoute(): JSX.Element {
  const { isOwner, joke } = useLoaderData<LoaderData>();
  return <JokeDisplay joke={joke} isOwner={isOwner} />;
};

function CatchBoundary() {
  const { status } = useCatch();
  const { jokeId } = useParams();
  switch (status) {
    case 400: {
      return <div className="error-container">What you&rsquo;re tying to do is not allowed.</div>;
    }
    case 404: {
      return <div className="error-container">Huh? What is "{jokeId}"</div>;
    }
    case 401: {
      return <div className="error-container">Sorry, but {jokeId} is not your joke.</div>;
    }
    default: {
      throw new Error(`Unhandled error: ${status}`);
    }
  }
}

function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry about that!`}</div>
  );
}

export { JokeRoute as default, CatchBoundary, ErrorBoundary, action, loader, meta };
