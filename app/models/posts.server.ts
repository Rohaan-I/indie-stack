import { prisma } from '~/db.server';

import type { Post } from "@prisma/client";
export type { Post };

export async function getPosts() {
    return prisma.post.findMany();
}

export async function getPost(slug: string) {
    return prisma.post.findUnique({ where: {slug}})
}

export async function createPost(post: Pick<Post, "slug" | "title" | "markdown">) {
    return prisma.post.create({data: post})
}

export async function updatePost(title: string, slug: string, markdown: string) {
    return prisma.post.update({
        where: {
            slug
        },
        data: {
            title,
            markdown
        }
    })
}