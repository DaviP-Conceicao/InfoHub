import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/categories";
import { getPublishedContentsByCategorySlug } from "@/lib/contents";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: "Categoria não encontrada",
    };
  }

  return {
    title: category.name,
    description:
      category.description ??
      `Conteúdos publicados na categoria ${category.name}.`,
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const contents = await getPublishedContentsByCategorySlug(slug);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            InfoHub
          </Link>

          <Link
            href="/#categorias"
            className="text-sm text-zinc-600 hover:text-zinc-950"
          >
            Voltar às categorias
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-zinc-500">
            Categoria
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {category.name}
          </h1>

          {category.description && (
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              {category.description}
            </p>
          )}
        </div>

        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Conteúdos</h2>

            <p className="mt-2 text-sm text-zinc-600">
              {contents.length} conteúdo
              {contents.length === 1 ? "" : "s"} publicado
              {contents.length === 1 ? "" : "s"} nesta categoria.
            </p>
          </div>

          {contents.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              Ainda não há conteúdos publicados nesta categoria.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {contents.map((content) => (
                <article
                  key={content.id}
                  className="rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-sm"
                >
                  <h3 className="text-lg font-semibold">
                    {content.title}
                  </h3>

                  {content.summary && (
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {content.summary}
                    </p>
                  )}

                  <Link
                    href={`/conteudos/${encodeURIComponent(content.slug)}`}
                    className="mt-4 inline-block text-sm font-medium underline"
                  >
                    Ler conteúdo →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-zinc-500">
          InfoHub — informação estruturada e acessível.
        </div>
      </footer>
    </main>
  );
}
