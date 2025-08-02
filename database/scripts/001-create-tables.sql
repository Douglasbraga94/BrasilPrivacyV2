-- BrasilPrivacy Database Schema
-- Sistema de Gerenciamento de Proteção de Dados

-- Áreas de Negócio
CREATE TABLE IF NOT EXISTS areas_negocio (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  responsavel VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processos de Negócio
CREATE TABLE IF NOT EXISTS processos_negocio (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  area_negocio_id INTEGER REFERENCES areas_negocio(id),
  responsavel VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locais de Coleta
CREATE TABLE IF NOT EXISTS locais_coleta (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(100),
  endereco TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Finalidades
CREATE TABLE IF NOT EXISTS finalidades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categoria de Titulares
CREATE TABLE IF NOT EXISTS categoria_titulares (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados Pessoais
CREATE TABLE IF NOT EXISTS dados_pessoais (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  formato VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados Sensíveis
CREATE TABLE IF NOT EXISTS dados_sensiveis (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  nivel_sensibilidade VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base Legal
CREATE TABLE IF NOT EXISTS base_legal (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  artigo_lgpd VARCHAR(50),
  tipo VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compartilhamento
CREATE TABLE IF NOT EXISTS compartilhamento (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  destinatario VARCHAR(255),
  finalidade VARCHAR(255),
  base_legal VARCHAR(255),
  tipo_transicao VARCHAR(100),
  pais_destino VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Retenção e Descarte
CREATE TABLE IF NOT EXISTS retencao_descarte (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  periodo_retencao VARCHAR(100),
  metodo_descarte VARCHAR(255),
  responsavel VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_areas_negocio_codigo ON areas_negocio(codigo);
CREATE INDEX IF NOT EXISTS idx_processos_negocio_codigo ON processos_negocio(codigo);
CREATE INDEX IF NOT EXISTS idx_processos_negocio_area ON processos_negocio(area_negocio_id);
CREATE INDEX IF NOT EXISTS idx_locais_coleta_codigo ON locais_coleta(codigo);
CREATE INDEX IF NOT EXISTS idx_finalidades_codigo ON finalidades(codigo);
CREATE INDEX IF NOT EXISTS idx_categoria_titulares_codigo ON categoria_titulares(codigo);
CREATE INDEX IF NOT EXISTS idx_dados_pessoais_codigo ON dados_pessoais(codigo);
CREATE INDEX IF NOT EXISTS idx_dados_sensiveis_codigo ON dados_sensiveis(codigo);
CREATE INDEX IF NOT EXISTS idx_base_legal_codigo ON base_legal(codigo);
CREATE INDEX IF NOT EXISTS idx_compartilhamento_codigo ON compartilhamento(codigo);
CREATE INDEX IF NOT EXISTS idx_retencao_descarte_codigo ON retencao_descarte(codigo);
