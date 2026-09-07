export const dynamic = "force-dynamic";

import { getCategories } from "@/lib/categories";
import { getPublishedContents } from "@/lib/contents";

export default async function Home() {
  const [categories, contents] = await Promise.all([
    getCategories(),
    getPublishedContents(),
  ]);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-bold tracking-tight">
            InfoHub
          </a>

          <nav className="flex gap-6 text-sm text-zinc-600">
            <a href="#categorias" className="hover:text-zinc-950">
              Categorias
            </a>

            <a href="#conteudos" className="hover:text-zinc-950">
              Conteúdos
            </a>

            <a href="/api/v1/contents" className="hover:text-zinc-950">
              API
            </a>
          </nav>
        </div>
      </header>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium text-zinc-500">
              Informação estruturada e acessível
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Informação útil para consultar, entender e reutilizar.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              O InfoHub organiza informações práticas em um formato simples
              para pessoas, desenvolvedores e sistemas de inteligência
              artificial.
            </p>

            <div className="mt-8 flex max-w-2xl">
              <input
                type="search"
                placeholder="O que você está procurando?"
                className="h-12 w-full rounded-l-lg border border-zinc-300 bg-white px-4 outline-none focus:border-zinc-500"
              />

              <button
                type="button"
                className="h-12 rounded-r-lg bg-zinc-950 px-6 font-medium text-white"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="categorias" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Categorias</h2>

          <p className="mt-2 text-zinc-600">
            Explore os principais grupos de informação do InfoHub.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-sm"
            >
              <h3 className="font-semibold">{category.name}</h3>

              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {category.description}
              </p>

              <span className="mt-5 inline-block text-sm font-medium">
                Explorar →
              </span>
            </article>
          ))}
        </div>
      </section>

      <section
        id="conteudos"
        className="border-t border-zinc-200 bg-white"
      >
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Conteúdos</h2>

            <p className="mt-2 text-zinc-600">
              Consulte os conteúdos publicados no InfoHub.
            </p>
          </div>

          {contents.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-600">
              Nenhum conteúdo publicado no momento.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {contents.map((content) => (
                <article
                  key={content.id}
                  className="rounded-xl border border-zinc-200 p-6 transition-shadow hover:shadow-sm"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {content.category}
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    {content.title}
                  </h3>

                  {content.summary && (
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {content.summary}
                    </p>
                  )}

                  <a
                    href={`/api/v1/contents/${encodeURIComponent(
                      content.slug
                    )}`}
                    className="mt-4 inline-block text-sm font-medium underline"
                  >
                    Ver conteúdo
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-zinc-500">
          InfoHub — informação estruturada e acessível.
        </div>
      </footer>
    </main>
  );
}
