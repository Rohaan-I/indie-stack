import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useTransition } from '@remix-run/react';
import { useState } from 'react';
import invariant from 'tiny-invariant';

import { getPost, updatePost } from "~/models/posts.server";

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const loader: LoaderFunction = async ({ params }) => {

    console.log(params);
    invariant(params.slug, "params.slug is required!")

    return json({
        post: await getPost(params.slug)
    })
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title");
    const slug = formData.get("slug");
    const markdown = formData.get("markdown");

    const errors: ActionData = {
        title: title ? null : "Title is required",
        slug: slug ? null : "Slug is required",
        markdown: markdown ? null : "Markdown is required",
    };
    const hasErrors = Object.values(errors).some(
        (errorMessage) => errorMessage
    );

    if(hasErrors) {
        return json<ActionData>(errors);
    }

    invariant(
        typeof title === "string",
        "title must be a string"
    );
    invariant(
        typeof slug === "string",
        "slug must be a string"
    );
    invariant(
        typeof markdown === "string",
        "markdown must be a string"
    );

    await updatePost(title, slug, markdown)

    return redirect("/posts/admin");

}


export default function AdminSlug() {

    const { post } = useLoaderData();
    const errors  = useActionData();
    const transition = useTransition();

    const isUpdating = Boolean(transition.submission);

    const [title, setTitle] = useState(post.title);
    const [slug, setSlug] = useState(post.slug);
    const [markdown, setMarkdown] = useState(post.markdown);

    console.log(post)
    
    return (
        <Form method="post">
            <p>
                <label>
                Post Title:{" "}
                {errors?.title ? (
                    <em className="text-red-600">{errors.title}</em>
                ) : null}
                <input
                    type="text"
                    name="title"
                    className={inputClassName}
                    value={title}
                    onChange={(evt) => setTitle(evt.target)}
                />
                </label>
            </p>
            <p>
                <label>
                Post Slug:{" "}
                {errors?.slug ? (
                    <em className="text-red-600">{errors.slug}</em>
                ) : null}
                <input
                    type="text"
                    name="slug"
                    className={inputClassName}
                    value={slug}
                    onChange={(evt) => setSlug(evt.target)}
                />
                </label>
            </p>
            <p>
                <label htmlFor="markdown">
                    Markdown: {" "}
                    {errors?.markdown ? (
                        <em className="text-red-600">
                        {errors.markdown}
                        </em>
                    ) : null}
                </label>
                <br />
                <textarea
                id="markdown"
                rows={20}
                name="markdown"
                className={`${inputClassName} font-mono`}
                value={markdown}
                onChange={(evt) => setMarkdown(evt.target)}
                />
            </p>
            <p className="text-right">
                <button
                type="submit"
                className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
                disabled={isUpdating}
                >
                { isUpdating ? "Updating..." : "Update Post" }
                </button>
            </p>
        </Form>
    );
}