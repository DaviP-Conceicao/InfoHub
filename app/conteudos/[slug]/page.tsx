import { getPublishedContentBySlug } from "@/lib/contents";
import { notFound } from "next/navigation";

type ContentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
          <a href="/" className="text-xl font-bold tracking-tight">
            InfoHub
          </a>

          <a
            href="/#conteudos"
            className="text-sm text-zinc-600 hover:text-zinc-950"
          >
            Voltar aos conteúdos
          </a>
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
      </article>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-zinc-500">
          InfoHub — informação estruturada e acessível.
        </div>
      </footer>
    </main>
  );
}