import { notFound, redirect } from "next/navigation";
import { getTopicBySlug } from "../forum-data";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LegacyTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  redirect(`/forum/topico/${topic.id}`);
}
