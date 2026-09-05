-- ============================================================
-- InfoHub
-- 001_initial_schema.sql
--
-- Schema inicial do banco de dados.
-- MariaDB 11.8+
-- ============================================================

USE infohub;

-- ============================================================
-- CATEGORIES
-- Categorias principais do conhecimento
-- ============================================================

CREATE TABLE categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description VARCHAR(500) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- CONTENTS
-- Núcleo do conhecimento do InfoHub
-- ============================================================

CREATE TABLE contents (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    summary VARCHAR(500) NULL,

    -- Conteúdo principal em Markdown
    content TEXT NOT NULL,

    -- Dados específicos e estruturados
    data JSON NULL,

    -- draft / published / archived
    status VARCHAR(20) NOT NULL DEFAULT 'draft',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_contents_slug (slug),

    KEY idx_contents_category (category_id),
    KEY idx_contents_status (status),

    CONSTRAINT fk_contents_category
        FOREIGN KEY (category_id)
        REFERENCES categories (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_contents_status
        CHECK (status IN ('draft', 'published', 'archived'))

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SOURCES
-- Fontes utilizadas para verificar o conteúdo
-- ============================================================

CREATE TABLE sources (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    content_id BIGINT UNSIGNED NOT NULL,

    name VARCHAR(200) NOT NULL,
    url VARCHAR(2048) NOT NULL,

    -- Ex.: official, documentation, academic, other
    source_type VARCHAR(50) NOT NULL DEFAULT 'other',

    verified_at DATE NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_sources_content (content_id),

    CONSTRAINT fk_sources_content
        FOREIGN KEY (content_id)
        REFERENCES contents (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TAGS
-- Palavras-chave para classificação e busca
-- ============================================================

CREATE TABLE tags (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uq_tags_name (name),
    UNIQUE KEY uq_tags_slug (slug)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- CONTENT_TAGS
-- Relacionamento N:N entre conteúdos e tags
-- ============================================================

CREATE TABLE content_tags (
    content_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (content_id, tag_id),

    CONSTRAINT fk_content_tags_content
        FOREIGN KEY (content_id)
        REFERENCES contents (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_content_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- ALIASES
-- Outros nomes pelos quais um conteúdo pode ser encontrado
-- ============================================================

CREATE TABLE aliases (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    content_id BIGINT UNSIGNED NOT NULL,

    alias VARCHAR(200) NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uq_alias_content (content_id, alias),
    KEY idx_aliases_alias (alias),

    CONSTRAINT fk_aliases_content
        FOREIGN KEY (content_id)
        REFERENCES contents (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- CATEGORIAS INICIAIS
-- ============================================================

INSERT INTO categories
    (name, slug, description)
VALUES
    (
        'Datas e Calendário',
        'datas-calendario',
        'Feriados, datas comemorativas, calendários e informações relacionadas a datas.'
    ),
    (
        'Matemática e Conversões',
        'matematica-conversoes',
        'Cálculos, fórmulas, porcentagens, unidades e conversões.'
    ),
    (
        'Tecnologia e Programação',
        'tecnologia-programacao',
        'Programação, sistemas, internet, protocolos e referências técnicas.'
    ),
    (
        'Países e Geografia',
        'paises-geografia',
        'Informações estruturadas sobre países, regiões e geografia.'
    ),
    (
        'Ferramentas Práticas',
        'ferramentas-praticas',
        'Informações e ferramentas úteis para tarefas do dia a dia.'
    );
