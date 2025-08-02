-- BrasilPrivacy - Dados de Exemplo
-- Inserção de dados iniciais para demonstração

-- Áreas de Negócio
INSERT INTO areas_negocio (codigo, nome, descricao, responsavel) VALUES
('AN-01', 'Recursos Humanos', 'Área responsável pela gestão de pessoas e talentos', 'Maria Silva'),
('AN-02', 'Vendas', 'Área comercial responsável pelas vendas e relacionamento com clientes', 'João Santos'),
('AN-03', 'Marketing', 'Área responsável pelas estratégias de marketing e comunicação', 'Ana Costa'),
('AN-04', 'Financeiro', 'Área responsável pela gestão financeira e contábil', 'Carlos Oliveira'),
('AN-05', 'TI', 'Área de Tecnologia da Informação', 'Pedro Lima'),
('AN-06', 'Jurídico', 'Área jurídica e compliance', 'Lucia Ferreira');

-- Processos de Negócio
INSERT INTO processos_negocio (codigo, nome, descricao, area_negocio_id, responsavel) VALUES
('PN-01', 'Recrutamento e Seleção', 'Processo de contratação de novos funcionários', 1, 'Maria Silva'),
('PN-02', 'Folha de Pagamento', 'Processamento da folha de pagamento mensal', 1, 'Maria Silva'),
('PN-03', 'Vendas Online', 'Processo de vendas através do e-commerce', 2, 'João Santos'),
('PN-04', 'Atendimento ao Cliente', 'Suporte e atendimento aos clientes', 2, 'João Santos'),
('PN-05', 'Campanhas de Email', 'Envio de campanhas de marketing por email', 3, 'Ana Costa'),
('PN-06', 'Gestão de Leads', 'Captação e qualificação de leads', 3, 'Ana Costa'),
('PN-07', 'Cobrança', 'Processo de cobrança de clientes inadimplentes', 4, 'Carlos Oliveira'),
('PN-08', 'Backup de Dados', 'Rotina de backup dos sistemas', 5, 'Pedro Lima');

-- Locais de Coleta
INSERT INTO locais_coleta (codigo, nome, descricao, tipo, endereco) VALUES
('LC-01', 'Site Institucional', 'Formulários de contato no site', 'Online', 'www.brasilprivacy.com.br'),
('LC-02', 'Loja Física - SP', 'Coleta presencial na loja de São Paulo', 'Físico', 'Av. Paulista, 1000 - São Paulo/SP'),
('LC-03', 'Call Center', 'Atendimento telefônico', 'Telefônico', 'Central de Atendimento'),
('LC-04', 'Aplicativo Mobile', 'App para dispositivos móveis', 'Online', 'App BrasilPrivacy'),
('LC-05', 'Eventos e Feiras', 'Coleta em eventos corporativos', 'Presencial', 'Diversos locais');

-- Finalidades
INSERT INTO finalidades (codigo, nome, descricao, categoria) VALUES
('FN-01', 'Execução de Contrato', 'Cumprimento de obrigações contratuais', 'Contratual'),
('FN-02', 'Marketing Direto', 'Envio de comunicações promocionais', 'Marketing'),
('FN-03', 'Atendimento ao Cliente', 'Suporte e relacionamento com clientes', 'Atendimento'),
('FN-04', 'Obrigação Legal', 'Cumprimento de obrigações legais', 'Legal'),
('FN-05', 'Legítimo Interesse', 'Atividades de legítimo interesse da empresa', 'Interesse Legítimo'),
('FN-06', 'Consentimento', 'Atividades baseadas em consentimento', 'Consentimento');

-- Categoria de Titulares
INSERT INTO categoria_titulares (codigo, nome, descricao, tipo) VALUES
('CT-01', 'Clientes', 'Pessoas que adquirem produtos ou serviços', 'Externo'),
('CT-02', 'Funcionários', 'Colaboradores da empresa', 'Interno'),
('CT-03', 'Fornecedores', 'Empresas e pessoas que fornecem produtos/serviços', 'Externo'),
('CT-04', 'Prospects', 'Potenciais clientes', 'Externo'),
('CT-05', 'Candidatos', 'Pessoas em processos seletivos', 'Externo'),
('CT-06', 'Visitantes', 'Visitantes do site e estabelecimentos', 'Externo');

-- Dados Pessoais
INSERT INTO dados_pessoais (codigo, nome, descricao, categoria, formato) VALUES
('DP-01', 'Nome Completo', 'Nome e sobrenome da pessoa', 'Identificação', 'Texto'),
('DP-02', 'CPF', 'Cadastro de Pessoa Física', 'Identificação', 'Numérico'),
('DP-03', 'Email', 'Endereço de email', 'Contato', 'Email'),
('DP-04', 'Telefone', 'Número de telefone', 'Contato', 'Numérico'),
('DP-05', 'Endereço', 'Endereço residencial completo', 'Localização', 'Texto'),
('DP-06', 'Data de Nascimento', 'Data de nascimento', 'Identificação', 'Data'),
('DP-07', 'RG', 'Registro Geral', 'Identificação', 'Alfanumérico'),
('DP-08', 'Estado Civil', 'Estado civil da pessoa', 'Pessoal', 'Texto');

-- Dados Sensíveis
INSERT INTO dados_sensiveis (codigo, nome, descricao, categoria, nivel_sensibilidade) VALUES
('DS-01', 'Dados de Saúde', 'Informações sobre condições de saúde', 'Saúde', 'Alto'),
('DS-02', 'Orientação Sexual', 'Informações sobre orientação sexual', 'Intimidade', 'Alto'),
('DS-03', 'Origem Racial', 'Informações sobre origem racial ou étnica', 'Origem', 'Alto'),
('DS-04', 'Convicções Religiosas', 'Crenças e convicções religiosas', 'Religião', 'Alto'),
('DS-05', 'Opiniões Políticas', 'Posicionamentos e opiniões políticas', 'Política', 'Alto'),
('DS-06', 'Dados Biométricos', 'Impressões digitais, reconhecimento facial', 'Biometria', 'Muito Alto');

-- Base Legal
INSERT INTO base_legal (codigo, nome, descricao, artigo_lgpd, tipo) VALUES
('BL-01', 'Consentimento', 'Consentimento livre, informado e inequívoco', 'Art. 7º, I', 'Consentimento'),
('BL-02', 'Execução de Contrato', 'Cumprimento de obrigação legal ou regulatória', 'Art. 7º, II', 'Contratual'),
('BL-03', 'Obrigação Legal', 'Cumprimento de obrigação legal ou regulatória', 'Art. 7º, III', 'Legal'),
('BL-04', 'Legítimo Interesse', 'Atendimento aos interesses legítimos', 'Art. 7º, IX', 'Interesse Legítimo'),
('BL-05', 'Exercício de Direitos', 'Exercício regular de direitos em processo', 'Art. 7º, VI', 'Judicial'),
('BL-06', 'Proteção da Vida', 'Proteção da vida ou incolumidade física', 'Art. 7º, VII', 'Vital');

-- Compartilhamento
INSERT INTO compartilhamento (codigo, nome, descricao, destinatario, finalidade, base_legal) VALUES
('CP-01', 'Parceiros Comerciais', 'Compartilhamento com parceiros para vendas', 'Empresas Parceiras', 'Execução de Vendas', 'Execução de Contrato'),
('CP-02', 'Órgãos Reguladores', 'Envio de dados para órgãos fiscalizadores', 'Receita Federal, INSS', 'Cumprimento Legal', 'Obrigação Legal'),
('CP-03', 'Prestadores de Serviço', 'Terceirização de serviços de TI', 'Empresas de TI', 'Suporte Técnico', 'Legítimo Interesse'),
('CP-04', 'Instituições Financeiras', 'Processamento de pagamentos', 'Bancos e Fintechs', 'Processamento Financeiro', 'Execução de Contrato');

-- Retenção e Descarte
INSERT INTO retencao_descarte (codigo, nome, descricao, periodo_retencao, metodo_descarte, responsavel) VALUES
('RD-01', 'Dados de Clientes', 'Retenção de dados de clientes ativos', '5 anos após término do contrato', 'Exclusão segura dos sistemas', 'TI'),
('RD-02', 'Dados de Funcionários', 'Retenção de dados de ex-funcionários', '20 anos após desligamento', 'Arquivamento físico seguro', 'RH'),
('RD-03', 'Logs de Sistema', 'Logs de acesso e operações', '2 anos', 'Exclusão automática', 'TI'),
('RD-04', 'Dados Financeiros', 'Documentos fiscais e contábeis', '10 anos', 'Arquivamento físico', 'Financeiro'),
('RD-05', 'Dados de Marketing', 'Listas de contatos para marketing', '2 anos sem interação', 'Exclusão dos sistemas', 'Marketing');
