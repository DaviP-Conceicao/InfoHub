import type { Metadata } from "next";
import Link from "next/link";
import { searchPublishedContents } from "@/lib/search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Pesquise informações publicadas no InfoHub.",
  robots: {
    index: false,
    follow: true,
  },
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const results = query ? await searchPublishedContents(query) : [];

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            InfoHub
          </Link>

          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-950"
          >
            Voltar ao início
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-zinc-500">
            Pesquisa
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Buscar no InfoHub
          </h1>

          <form
            action="/buscar"
            method="get"
            className="mt-8 flex max-w-2xl"
          >
            <label htmlFor="search-query" className="sr-only">
              O que você está procurando?
            </label>

            <input
              id="search-query"
              name="q"
              type="search"
              defaultValue={query}
              maxLength={100}
              placeholder="O que você está procurando?"
              className="h-12 w-full rounded-l-lg border border-zinc-300 bg-white px-4 outline-none focus:border-zinc-500"
            />

            <button
              type="submit"
              className="h-12 rounded-r-lg bg-zinc-950 px-6 font-medium text-white hover:bg-zinc-800"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="mt-12">
          {!query ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              Digite um termo para iniciar a busca.
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h2 className="font-semibold">
                Nenhum resultado encontrado
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Não encontramos conteúdos publicados para &quot;{query}&quot;.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Resultados
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                  {results.length} resultado
                  {results.length === 1 ? "" : "s"} encontrado
                  {results.length === 1 ? "" : "s"} para &quot;{query}&quot;.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {results.map((result) => (
                  <article
                    key={result.id}
                    className="rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-sm"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {result.category}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold">
                      {result.title}
                    </h3>

                    {result.summary && (
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {result.summary}
                      </p>
                    )}

                    <Link
                      href={`/conteudos/${encodeURIComponent(result.slug)}`}
                      className="mt-4 inline-block text-sm font-medium underline"
                    >
                      Ler conteúdo →
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-zinc-500">
          InfoHub — informação estruturada e acessível.
        </div>
      </footer>
    </main>
  );
}
