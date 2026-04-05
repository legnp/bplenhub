---
description: Template para criação de novas Pesquisas (Surveys) no BPlen HUB
---

# 📋 Roteiro de Nova Pesquisa (Survey)

Preencha as informações abaixo para que eu possa realizar a implementação técnica seguindo a governança do projeto.

## 1. Identificação Core
- **ID da Survey**: (preencha automatico)
- **Título Visual**: (Check-in)
- **Domínio**: (Hub/admin/survey)

## 2. Estrutura de Perguntas (Passo a Passo)
Descreva as perguntas, opções e o tipo de campo (Múltipla Escolha, Texto, Escala 0-10, etc).
> *Exemplo: Passo 1: "Qual sua nota para o mentor?" (Escala 0-10)*

---
Enunciados, tipos, opções e condicionamentos
1.	q1_intro
•	Tipo: buttons
•	Enunciado: Olá {User-nickname}! Agora que já se familiarizou com a plataforma, você nos permite conhecer um pouco mais sobre você?
•	Opções:
•	Com certeza
•	Sim, mas não muito
•	Condicionamento:
•	Com certeza -> q2_com_certeza
•	Sim, mas não muito -> q2_mas_nao_muito
2.	q2_mas_nao_muito
•	Tipo: text
•	Enunciado: {User-nickname}, entendido. Hoje qual é a sua maior preocupação em contar sobre você?
•	Condicionamento:
•	segue para q3_objetivos
3.	q2_com_certeza
•	Tipo: text
•	Enunciado: Legal!!! Vamos nessa! Qual é a melhor coisa sobre você, que deveríamos saber para te apoiar na sua jornada?
•	Condicionamento:
•	segue para q3_objetivos
4.	q3_objetivos
•	Tipo: text
•	Enunciado: {User-nickname}, qual é o seu principal objetivo pelos próximos 90 dias, 6 meses e 5 anos?
•	Condicionamento:
•	segue para q4_barreiras
5.	q4_barreiras
•	Tipo: text
•	Enunciado: Quais são as maiores barreiras que você enfrenta hoje para alcançar esses objetivos?
•	Condicionamento:
•	segue para q5_desafios
6.	q5_desafios
•	Tipo: multi_select
•	Enunciado: Certo! E dentro desse contexto, quais são os SEUS 3 a 5 maiores desafios?
•	Opções:
•	Entender jargões, termos técnicos ou expressões
•	Organizar o meu tempo e a priorização de tarefas diárias
•	Esforço excessivo para manter meu foco e concentração
•	Ergonomia ou ambiente inadequado
•	Sobrecarga de informações (dificuldade em filtrar o que é útil)
•	Dificuldade que os outros me entendam com clareza
•	Resistência ou dificuldade em me adaptar a novas ferramentas
•	Dificuldade em delegar tarefas e confiar que os outros vão entregar
•	Falta de clareza no alinhamento de expectativas com outros
•	Eu travo em dar ou receber feedbacks positivos e/ou difíceis (corretivos)
•	Sensação de sobrecarga constante ou proximidade de burnout
•	Síndrome do Impostor (medo de não estar à altura dos desafios)
•	Ansiedade em relação a resultados futuros ou mudanças
•	Exaustão mental causada pelo excesso de tomada de decisão
•	Dificuldade em me desconectar das atividades (falta de "botão off")
•	Condicionamento:
•	mínimo 3 seleções
•	máximo 5 seleções
•	lista embaralhada a cada renderização
•	segue para q6_pausa
7.	q6_ nicho
•	Tipo: cascaded_select
•	Enunciado: Que avanço! Parabéns! Sabemos que nem sempre é tão fácil resumir nossos desafios em algumas palavras. Mas é isso, um passo por vez! 
 {User-nickname}, qual o seu principal nicho e área de atuação hoje?
•	Campos:
•	nicho
•	departamento
•	Opções nicho:
•	Tecnologia
•	Saúde
•	Educação
•	Finanças
•	Marketing
•	Indústria
•	Varejo
•	Outros
•	Opções departamento:
•	Desenvolvimento
•	Vendas
•	RH
•	Marketing
•	Operações
•	Financeiro
•	Diretoria
•	Outros
•	Condicionamento:
•	departamento depende de nicho
•	se selecionar Outros em qualquer select, abre campo texto complementar:
•	nicho_outros
•	departamento_outros
•	segue para q7_rotina
8.	q7_rotina
•	Tipo: text
•	Enunciado: Nos conte um pouco mais sobre o que você faz. Qual é o seu cargo atual? Quais são suas atividades? Como é a sua rotina?
•	Condicionamento:
•	segue para q8a_maturidade
10.	q8a_maturidade
•	Tipo: cascaded_buttons_select
•	Enunciado: Qual é o estágio da maturidade da sua carreira profissional?
•	Campos:
•	estagio
•	anos_exp
•	Opções estagio:
•	Aprendiz
•	Junior
•	Pleno
•	Sênior
•	Conselheiro
•	Diretoria
•	Dono
•	Opções anos_exp:
•	1 ano até 40 anos
•	Condicionamento:
•	anos_exp depende de estagio
•	segue para q8b_regime
11.	q8b_regime
•	Tipo: buttons
•	Enunciado: {User-nickname}, hoje você está empregado em regime CLT ou PJ?
•	Opções:
•	Sim
•	Não
•	Condicionamento:
•	Sim -> q8c_pacote
•	Não -> q9_rendimento
12.	Q8c_pacote
•	Tipo: benefits_package
•	Enunciado: Como está o seu pacote de remuneração e benefícios atual?
•	Opções/itens de benefícios:
•	Salário
•	Bônus/PLR
•	Previdência Privada
•	VR/VA Flex
•	VR
•	VA
•	VT
•	Vale Combustível
•	Estacionamento
•	Seguro Médico
•	Seguro Odontológico
•	Seguro de Vida
•	Dayoff
•	Home Office
•	Algum outro benefício que não foi listado?
•	Condicionamentos principais:
•	cada benefício pode ser ativado
•	salario
•	campos:
•	ben_salario_moeda (conectar a banco de dados publico ou biblioteca com listagem ampla)
•	ben_salario_valor (validação de apenas números e virgula)
•	bonus
•	campos:
•	ben_bonus_moeda (conectar a banco de dados publico ou biblioteca com listagem ampla)
•	ben_bonus_valor (validação de apenas números e virgula)
•	ben_bonus_base_calculo
•	opções ben_bonus_base_calculo:
•	Quantidade de salários 
•	Porcentagem dos resultados (validação % de apenas números)
•	se Quantidade de salários:
•	ben_bonus_qtd_salarios (apenas números e virgula)
•	ben_bonus_meta: Sim, Não
•	se Sim:
•	ben_bonus_meta_desc
•	ben_bonus_frequencia:
•	Mensal
•	Trimestral
•	Semestral
•	Anual
•	previdencia
•	campos:
•	ben_previdencia_moeda (conectar a banco de dados publico ou biblioteca com listagem ampla)
•	ben_previdencia_valor
•	ben_previdencia_empresa_contribui: Sim, Não
•	ben_previdencia_teto
•	ben_previdencia_desconto: Sim, Não
•	se ben_previdencia_empresa_contribui = Sim:
•	ben_previdencia_empresa_valor
•	vrva_flex, vr, va, vt, vale_combustivel
•	campos:
•	ben_{id}_valor (apenas números e virgula)
•	ben_{id}_desconto: Sim, Não
•	estacionamento
•	ben_estacionamento_tipo:
•	Integral
•	Valor compartilhado
•	ben_estacionamento_desconto: Sim, Não
•	seguro_medico e seguro_odonto
•	ben_{id}_seguradora:
•	Bradesco Saúde
•	Amil
•	SulAmérica
•	Unimed
•	Porto Seguro
•	Notre Dame Intermédica
•	Hapvida
•	Allianz Saúde
•	MetLife
•	Omint
•	Mediservice
•	Care Plus
•	Cassi
•	Outros
•	se Outros:
•	ben_{id}_seguradora_outros
•	ben_{id}_coparticipacao: Sim, Não
•	ben_{id}_desconto: Sim, Não
•	seguro_vida, dayoff, home_office
•	apenas chave booleana, sem subcampos
•	ben_outros
•	texto livre para benefício adicional
•	segue para q10_ como_podemos_ajudar
13.	q9_rendimento
•	Tipo: currency_group
•	Enunciado: Qual é o seu rendimento médio mensal?
•	Campos:
•	bloco Atual
•	moeda_1
•	valor_1
•	bloco Expectativa
•	moeda_2
•	valor_2
•	Opções de moeda: (conectar a banco de dados publico ou biblioteca com listagem ampla)
•	Condicionamento:
•	botão textual Prefiro não responder -> avança direto para q10_como_podemos_ajudar
14.	q10_como_podemos_ajudar
•	Tipo: text
•	Enunciado: {User-nickname}, porque você deu sua permissão a BPlen para te ajudar na jornada do desenvolvimento da sua carreira, o que você espera encontrar por aqui? Como podemos te ajudar?
•	Condicionamento:
•	segue para q11_likert
15.	q11_likert
•	Tipo: likert
•	Enunciado: Até aqui, como você avalia a sua experiência? E como gostaria que continuássemos te conduzindo?
•	Opções:
•	1
•	2
•	3
•	4
•	5
•	Campo condicional:
•	feedback só aparece após selecionar uma nota
•	Condicionamento:
•	após seleção da nota, exibe campo de feedback
•	depois -> COMPLETE

---

## 3. Lógica de Negócio e Efeitos (Side-Effects)
O que deve acontecer **após** o usuário clicar em enviar? 
- [ ] Criar/Atualizar campo na raiz do Usuário? (Qual campo?)
- [x ] Sincronizar com Google Drive/Sheets?
- [ ] Alterar o nível de acesso (Role) do usuário?
- [ ] Outros: (Descreva aqui)

## 4. Instruções Adicionais
(Alguma regra visual específica? Algum redirecionamento customizado após o fim?)