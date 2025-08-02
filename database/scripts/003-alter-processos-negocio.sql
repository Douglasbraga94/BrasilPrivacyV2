-- Adiciona os campos 'status' e 'email' na tabela processos_negocio
ALTER TABLE processos_negocio ADD COLUMN status VARCHAR(20) DEFAULT 'Ativo';
ALTER TABLE processos_negocio ADD COLUMN email VARCHAR(255);
