import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useCatch, useTransition } from '@remix-run/react';
import { JokeDisplay } from '~/components/joke';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorised', { status: 401 });
  }
  return json({});
};

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return 'That joke is too short';
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return 'That joke name is too short';
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const name = form.get('name');
  const content = form.get('content');
  if (typeof name !== 'string' || typeof content !== 'string') {
    return badRequest({
      formError: 'Form not submitted correctly',
    });
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };
  const fields = { name, content };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }
  const { id } = await db.joke.create({ data: { name, content, jokesterId: userId } });
  return redirect(`/jokes/${id}`);
};

const NewJokeRoute = function NewJokeRoute(): JSX.Element {
  // throw new Error('Testing Error Boundary');
  const actionData = useActionData<ActionData>();
  const { submission } = useTransition();

  if (submission) {
    const name = submission.formData.get('name');
    const content = submission.formData.get('content');
    if (
      typeof name === 'string' &&
      typeof content === 'string' &&
      !validateJokeContent(content) &&
      !validateJokeName(name)
    ) {
      return <JokeDisplay joke={{ name, content }} isOwner={true} canDelete={false} />;
    }
  }

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method="post">
        <div>
          <label>
            Name:{' '}
            <input
              type="text"
              defaultValue={actionData?.fields?.name}
              name="name"
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-errormessage={actionData?.fieldErrors?.name ? 'name-error' : undefined}
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(actionData?.fieldErrors?.content) || undefined}
              aria-errormessage={actionData?.fieldErrors?.content ? 'content-error' : undefined}
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p className="form-validation-error" role="alert" id="content-error">
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p className="form-validation-errror" role="alert">
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
};

export function CatchBoundary() {
  const { status } = useCatch();

  if (status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login" prefetch="intent">
          Login
        </Link>
      </div>
    );
  }
}

const ErrorBoundary = function ErrorBoundary() {
  return <div className="error-container">Something unexpected has happend. Terribly sorry!</div>;
};

export { NewJokeRoute as default, ErrorBoundary };
