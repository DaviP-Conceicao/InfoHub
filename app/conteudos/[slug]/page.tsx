import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedContentBySlug } from "@/lib/contents";

type ContentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const SITE_URL = "https://infohub-production-78c5.up.railway.app";

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;

  const contents = await getPublishedContentBySlug(slug);
  const content = contents[0];

  if (!content) {
    return {
      title: "Conteúdo não encontrado",
      description: "O conteúdo solicitado não foi encontrado no InfoHub.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    content.summary?.trim() ||
    `Consulte informações sobre ${content.title} no InfoHub.`;

  const canonicalUrl = `${SITE_URL}/conteudos/${encodeURIComponent(
    content.slug
  )}`;

  return {
    title: content.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: content.title,
      description,
      siteName: "InfoHub",
      locale: "pt_BR",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ContentPage({
  params,
}: ContentPageProps) {
  const { slug } = await params;

  const contents = await getPublishedContentBySlug(slug);
  const content = contents[0];

  if (!content) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            InfoHub
          </Link>

          <Link
            href="/#conteudos"
            className="text-sm text-zinc-600 hover:text-zinc-950"
          >
            Voltar aos conteúdos
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {content.category}
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {content.title}
          </h1>

          {content.summary && (
            <p className="mt-5 text-lg leading-8 text-zinc-600">
              {content.summary}
            </p>
          )}
        </div>

        <div className="border-t border-zinc-200 pt-8">
          <div className="whitespace-pre-wrap text-base leading-8 text-zinc-800">
            {content.content}
          </div>
        </div>

        {content.sources.length > 0 && (
          <section className="mt-12 border-t border-zinc-200 pt-8">
            <h2 className="text-xl font-semibold tracking-tight">
              Fontes
            </h2>

            <ul className="mt-5 space-y-4">
              {content.sources.map((source) => (
                <li
                  key={source.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4"
                >
                  <p className="font-medium text-zinc-900">
                    {source.name}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Tipo: {source.source_type}
                  </p>

                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-all text-sm text-zinc-600 underline hover:text-zinc-950"
                  >
                    {source.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-zinc-500">
          InfoHub — informação estruturada e acessível.
        </div>
      </footer>
    </main>
  );
}
