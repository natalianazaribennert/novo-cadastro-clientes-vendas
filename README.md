# Novo Cadastro de Clientes — Módulo Vendas

Tela de novo cadastro de clientes do módulo **Vendas** do sistema **Meu Crediário**, implementada como protótipo front-end pronto para integração com back-end.

---

## Visão geral

Este repositório contém o front-end completo da tela de novo cadastro de clientes do módulo de Vendas. O formulário cobre todas as etapas do cadastro — Identificação, Endereço, Contato, Ocupação, Referências e Observações — com navegação lateral fixa e indicador de situação do cadastro em tempo real.

A página foi construída para se encaixar na stack já existente em `vendas.meucrediario.com.br` — sem nenhuma dependência nova, sem build tool.

---

## Stack

| Tecnologia | Versão | Origem |
|---|---|---|
| AngularJS | 1.6.10 | CDN |
| jQuery | 3.6.0 | CDN |
| Font Awesome | 6.5.2 Free | CDN |
| Titillium Web | 400 / 600 / 700 | Google Fonts |

Nenhum bundler, nenhum `npm install` necessário. Todos os assets são carregados via CDN em `index.html`.

---

## Estrutura de arquivos

```
novo-cadastro-clientes-vendas/
├── index.html                # Shell da aplicação (CDN + ng-app + ng-controller)
├── app.js                    # Módulo AngularJS + diretiva de máscara
├── css/
│   └── novo-cadastro.css     # Tokens de marca e estilos dos componentes
└── js/
    └── NovoCadastroCtrl.js   # Controller com lógica de formulário e integrações
```

---

## Como rodar localmente

Qualquer servidor HTTP estático funciona. Exemplos:

```bash
# Node.js (npx, sem instalar nada)
npx serve .

# Python 3
python -m http.server 3400

# VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

Abra `http://localhost:3400` no navegador.

> **Não abra `index.html` diretamente como arquivo** (`file://`). O AngularJS precisa de um servidor HTTP para funcionar corretamente.

---

## Funcionalidades

### Formulário
- **Identificação** — CPF (com validação de dígitos verificadores), nome completo, data de nascimento, RG e situação conjugal
- **Endereço** — autocomplete de cidades via API IBGE + busca de CEP/rua via ViaCEP
- **Contato** — celular, e-mail, telefones fixos
- **Ocupação** — profissão com autocomplete (lista CBO), empresa e salário
- **Referências** — até 2 referências com vínculo, celular e telefone
- **Observações** — sistema de tags

### Validações
| Campo | Tipo | Gatilho |
|---|---|---|
| CPF | Algoritmo Receita Federal + dígitos repetidos | Ao completar 11 dígitos |
| Nome completo | Obrigatório + bloqueio de números | On blur |
| Data de nascimento | Formato, ano mínimo 1900, data futura, menor de idade | Ao completar 10 chars |
| Data de emissão RG | Formato, ano mínimo 1940, anterior ao nascimento | Ao completar 10 chars |
| E-mail | Formato | On blur |
| Celular / Telefones | Comprimento mínimo | On blur |

### Outros
- **Situação do cadastro** — indicador dinâmico (Incompleto → Básico → Desejável → Completo)
- **Navegação rápida** — sidebar com scroll-spy que acompanha a posição na página
- **Espelho do cliente** — modal com resumo de todos os campos preenchidos + histórico financeiro
- **Botões de ação** — Analisar, Vender e Apenas salvar (habilitados apenas com CPF e nome válidos)

---

## Integração com back-end

Os dados dinâmicos estão centralizados no objeto `appData` em [`js/NovoCadastroCtrl.js`](js/NovoCadastroCtrl.js). Quando o back-end estiver disponível, basta substituir os valores estáticos pelas chamadas `$http` correspondentes.

```js
// Exemplo: substituir por $http.get('/api/loja/info')
var appData = {
  storeName: 'Nome da loja',  // TODO: receber da API
  storeId:   '0000',          // TODO: receber da API
  userName:  'Usuário',       // TODO: receber da API
  financeiro: null,           // TODO: $http.get('/api/financeiro/cliente')
};
```

### Endpoints necessários

#### `GET /api/modulos`
Lista de módulos disponíveis para o usuário autenticado. Pode variar por plano/permissão.

**Resposta esperada:**
```json
[
  {
    "titulo": "string — nome do módulo",
    "img":    "string — caminho relativo ou URL absoluta da ilustração",
    "url":    "string — endereço do módulo (abre em nova aba)"
  }
]
```

---

### O que não precisa de endpoint

Os dados abaixo são configuração estática de UI — iguais para todos os usuários, não precisam vir do back-end:

| Variável | Descrição |
|---|---|
| `$scope.vinculoOpts` | Opções do campo Vínculo nas referências |
| `PROFISSOES` | Lista de profissões (CBO) do autocomplete |

---

## Design de referência

- **Figma:** [`UXSTUDY-1 — Melhorias no Vendas`](https://www.figma.com/design/TO7ncgH7p35DaS0LudLv2H/-UXSTUDY-1--Melhorias-no-Vendas?node-id=996-9068&m=dev)
- Nó principal: `996:9068`

---

## Tokens de cor (CSS custom properties)

Definidos em [`css/novo-cadastro.css`](css/novo-cadastro.css):

| Variável | Valor | Uso |
|---|---|---|
| `--header-bg` | `#007161` | Background do header |
| `--primary-light` | `#00856e` | Botões primários ativos |
| `--brand` | `#06664f` | Divisor do header |
| `--text-regular` | `#6e7697` | Labels e textos padrão |
| `--gray-dark` | `#333333` | Textos escuros |
| `--gray-medium` | `#cccccc` | Bordas de campos |
| `--gray-light` | `#e5e5e5` | Bordas suaves |
| `--white-dark` | `#f3f4f6` | Fundo de subseções |
| `--white-light` | `#f9fafb` | Fundo da página |
| `--red-medium` | `#c54031` | Asterisco de campo obrigatório e erros |
| `--orange-dark` | `#925c07` | Card de alerta |
| `--orange-light` | `#faf0e1` | Fundo do card de alerta |
