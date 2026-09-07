import { RowDataPacket } from "mysql2";
import { db } from "../../lib/db";
import { createContentWithSources } from "../../lib/contents";

type CountRow = RowDataPacket & {
  count: number;
};

async function main() {
  const slug = `teste-rollback-${Date.now()}`;

  try {
    await createContentWithSources(
      {
        categoryId: 3,
        title: "Teste de rollback",
        slug,
        summary: "Conteúdo criado apenas para testar rollback.",
        content: "Este conteúdo não deve permanecer no banco.",
        data: {
          rollbackTest: true,
        },
        status: "draft",
      },
      [
        {
          name: "Fonte válida",
          url: "https://example.com/",
          sourceType: "other",
        },
        {
          name: "Fonte inválida",
          url: "https://example.com/",
          sourceType: "x".repeat(51),
        },
      ]
    );

    throw new Error(
      "A transação deveria ter falhado, mas foi concluída."
    );
  } catch {
    console.log("✓ transação falhou como esperado");

    const [rows] = await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS count
      FROM contents
      WHERE slug = ?
      `,
      [slug]
    );

    const count = Number(rows[0]?.count ?? 0);

    if (count !== 0) {
      throw new Error(
        `Rollback falhou: ${count} registro(s) encontrado(s).`
      );
    }

    console.log(
      "✓ rollback confirmou que o conteúdo não permaneceu"
    );
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("\n✗ Teste de rollback falhou.");
  console.error(error);
  process.exit(1);
});
