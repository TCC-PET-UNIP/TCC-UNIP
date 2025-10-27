# Integração Frontend → Backend: Vetores de Características

Este documento descreve de forma objetiva e prática o que o backend espera que o frontend envie para formar os "vetores de características" usados pelo modelo de compatibilidade. Está focado exclusivamente na forma, ordem e valores esperados dos vetores (Adotante e Pet), para facilitar a integração.

> Observação: o backend armazena `vetor_caracteristicas` como um `ArrayField` no Django. Envie valores numéricos (inteiros preferencialmente).

## Regras gerais

- Envie vetores como arrays (listas) de números. Preferível: application/json. Se usar multipart/form-data (ex.: upload de imagem), serialize o vetor como JSON string (por exemplo: `vetor_caracteristicas = "[1,5,0,0,1,1,1]"`).
- Valide localmente antes de enviar: tamanho do vetor e domínio dos valores por índice.
- Backend espera:
  - Adotante: vetor com exatamente 13 elementos (ordem fixa)
  - Pet: vetor com exatamente 7 elementos (ordem fixa)

---

## 1) Vetor do ADOTANTE (13 elementos — índices 0..12)

Cada elemento tem posição fixa (não reordene). Tipos: números (inteiro). Valores aceitáveis indicados quando aplicável.

Índice → nome → descrição → valores permitidos

0 — tipo_imovel

- Tipo de imóvel do adotante.
- Valores: 1 = Apartamento Pequeno | 2 = Apartamento Grande | 3 = Casa | 4 = Casa com Quintal Grande | 5 = Chácara/Sítio

1 — area_externa

- Possui área externa?
- Valores: 1 = Sim | 0 = Não

2 — imovel_telado

- Imóvel possui telas (janelas/sacada telada)?
- Valores: 1 = Sim | 0 = Não

3 — qtd_moradores

- Quantidade de moradores na residência.
- Valor: inteiro (ex.: 1..6). Backend e seed usam intervalos pequenos (ex.: 1..6) — certifique-se de enviar um inteiro razoável.

4 — criancas

- Possui crianças na casa?
- Valores: 1 = Sim | 0 = Não

5 — idosos

- Possui idosos na casa?
- Valores: 1 = Sim | 0 = Não

6 — outros_animais

- Já possui outros animais?
- Valores: 1 = Sim | 0 = Não

7 — experiencia

- Experiência com animais (ordinal).
- Valores: 1 = Iniciante/Nenhuma | 2 = Pouca | 3 = Média | 4 = Experiente | 5 = Muito Experiente

8 — tempo_disponivel

- Tempo disponível para cuidar do pet (ordinal).
- Valores: 1 = Muito Pouco | 2 = Pouco | 3 = Moderado | 4 = Bastante | 5 = Muito Tempo

9 — tempo_fora

- Tempo que costuma ficar fora de casa (impacta disponibilidade).
- Valores: 1 = Quase Nunca | 2 = Poucas Horas | 3 = Período de Trabalho Padrão | 4 = Longo Período | 5 = Maior Parte do Dia

10 — aceita_especiais

- Aceita animais com necessidades especiais?
- Valores: 1 = Sim | 0 = Não

11 — gastos_mensais

- Estimativa de gastos mensais com o pet.
- Valores observados no seed: 1 = Baixo | 3 = Médio | 5 = Alto. Envie um desses valores.

12 — exp_previa_especie

- Já teve experiência prévia com esta espécie?
- Valores: 1 = Sim | 0 = Não

### Exemplo de vetor do adotante

```json
[3, 1, 1, 5, 0, 0, 1, 3, 5, 1, 1, 3, 1]
```

---

## 2) Vetor do PET (7 elementos — índices 0..6)

Índice → nome → descrição → valores permitidos

0 — especie

- Espécie do animal (tipo).
- Valores: 1 = Cão | 0 = Gato

1 — porte

- Porte do animal (ordinal).
- Valores recomendados: 1 = Mini | 2 = Pequeno | 3 = Médio | 4 = Grande | 5 = Gigante
- Observação: o seed contém um caso com valor 6; padronize para 1..5 para consistência.

2 — cuidados_especiais

- Precisa de cuidados especiais / condição crônica?
- Valores: 1 = Sim | 0 = Não

3 — trauma

- Histórico de trauma ou comportamento problemático?
- Valores: 1 = Possui | 0 = Não

4 — sociavel_criancas

- É sociável com crianças?
- Valores: 1 = Sim | 0 = Não

5 — sociavel_animais

- É sociável com outros animais?
- Valores: 1 = Sim | 0 = Não

6 — tutor_experiente

- Requer tutor experiente?
- Valores: 1 = Sim (recomendado) | 0 = Não

### Exemplo de vetor do pet

```json
[1, 5, 0, 0, 1, 1, 1]
```

---

## 3) Validações recomendadas no frontend (antes do envio)

- Verificar comprimento exato: adotante -> 13 elementos; pet -> 7 elementos.
- Coercer cada valor para Number e garantir tipo inteiro.
- Validar domínio de cada índice conforme tabela acima (ex.: binários 0/1 onde aplicável; ordinal 1..5; gastos entre {1,3,5}).
- Se usar formulário com `multipart/form-data` (upload de imagem), enviar `vetor_caracteristicas` como string JSON (p.ex. `"[1,5,0,0,1,1,1]"`).

## 4) Observações importantes

- O backend aplica uma "regra de segurança" que filtra pets que não sejam sociáveis com crianças quando o adotante tem crianças (índice 4 do adotante e índice 4 do pet), e que filtra pets que não sejam sociáveis com animais quando o adotante já tem outros animais (índice 6 do adotante e índice 5 do pet). Mesmo com alta pontuação do modelo, pets que violarem essas regras serão removidos.
- Banco: `vetor_caracteristicas` é um `ArrayField(IntegerField)` — prefira enviar inteiros para evitar problemas de armazenamento.
- Existe um vetor default para pets quando `vetor_caracteristicas` não é enviado: `[1,5,0,0,1,1,1]`.

## 5) Mapear perguntas do formulário para índices (exemplo prático)

- "Qual o tipo do imóvel?" → índice 0
- "Tem área externa?" → índice 1
- "O imóvel é telado?" → índice 2
- "Quantas pessoas moram na casa?" → índice 3
- "Possui crianças?" → índice 4
- "Possui idosos?" → índice 5
- "Possui outros animais?" → índice 6
- "Qual seu nível de experiência?" → índice 7
- "Quanto tempo tem disponível?" → índice 8
- "Quanto tempo passa fora de casa?" → índice 9
- "Aceita pets com necessidades especiais?" → índice 10
- "Gastos mensais estimados com pet?" → índice 11
- "Já teve experiência prévia com esta espécie?" → índice 12

--

Arquivo criado para uso do time frontend e integrações automáticas (bots/IAs). Mantenha a ordem e os domínios ao construir os vetores.
