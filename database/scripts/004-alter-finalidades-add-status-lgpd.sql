-- Adiciona os campos 'status' e 'conformeLGPD' na tabela finalidades
ALTER TABLE finalidades ADD COLUMN status VARCHAR(20) DEFAULT 'Ativa';
ALTER TABLE finalidades ADD COLUMN "conformeLGPD" BOOLEAN DEFAULT true;
