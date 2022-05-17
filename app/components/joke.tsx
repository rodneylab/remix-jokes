import type { Joke } from '@prisma/client';
import { Form, Link } from '@remix-run/react';

function JokeDisplay({
  joke,
  isOwner,
  canDelete,
}: {
  joke: Pick<Joke, 'content' | 'name'>;
  isOwner: boolean;
  canDelete?: boolean;
}) {
  const { content, name } = joke;

  return (
    <div>
      <p>Here&rsquo;s your hilarious joke:</p>
      <p>{content}</p>
      <Link to="." prefetch="intent">
        {name} Permalink
      </Link>
      {isOwner ? (
        <Form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="button" disabled={!canDelete}>
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  );
}

export default JokeDisplay;
