# 🖨️ Calculadora de Precificação 3D & Gerador de Orçamento em PDF

Uma aplicação web moderna, precisa e profissional desenvolvida com **Astro**, **React**, **Tailwind CSS**, **jsPDF** e **html2canvas**, inspirada na estética e precisão do ecossistema **Bambu Lab**.

Projetada para makers, estúdios de prototipagem e empresas de impressão 3D que necessitam precificar com rigor técnico (energia, depreciação de máquina, filamento, mão de obra e margem de falha) e gerar propostas comerciais em PDF limpas e elegantes para os clientes.

---

## ✨ Funcionalidades Principais

- ⚡ **Reatividade em Tempo Real:** Cálculos instantâneos conforme qualquer parâmetro é alterado.
- 🖨️ **Fórmula de Precificação Completa:**
  - **Material:** Custo de filamento por kg e peso unitário da peça em gramas.
  - **Energia Elétrica:** Potência em Watts, tempo em horas/minutos e custo por kWh.
  - **Depreciação de Equipamento:** Valor da impressora e vida útil estimada em horas.
  - **Mão de Obra e Setup:** Valor da sua hora e tempo de fatiamento/remoção de suportes.
  - **Custos Extras:** Embalagem e hardwares adicionais (parafusos, insertos, rolamentos).
  - **Risco & Falha:** Margem de segurança percentual para impressões que falham.
  - **Margem de Lucro Real:** Percentual sobre o custo real de produção.
  - **Taxas de Plataforma & Impostos:** Comissão percentual do marketplace (Shopee, Mercado Livre), taxa fixa por venda e impostos (MEI/Simples).
- 📦 **Suporte a Kits / Lotes:** Controle a quantidade de itens no lote com precificação unitária e total automática.
- 🖼️ **Upload de Foto da Peça 3D:** Carregue uma imagem ou print do fatiador com pré-visualização e inclusão automática no PDF.
- 📄 **Gerador de Orçamento em PDF Profissional:**
  - **Segurança Comercial:** Oculta propositalmente do cliente final a decomposição interna de custos (luz, máquina, filamento, taxa de falha).
  - **Layout Comercial Premium:** Cabeçalho com dados da sua empresa, número da proposta, data e validade, dados do cliente, especificações técnicas (material, cor, quantidade, prazo de entrega), foto da peça, descrição detalhada, tabela comercial e termos de garantia.
  - **Pré-visualização Interativa:** Ajuste dados comerciais antes de exportar ou faça o download direto com 1 clique.
- 💬 **Compartilhamento Rápido no WhatsApp:** Copie uma mensagem formatada com os valores e detalhes pronta para colar na conversa com o cliente.
- 💾 **Persistência & Backup:** Salva automaticamente no navegador (`localStorage`) e permite exportar/importar projetos em arquivos `.json`.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js versão 18 ou 20+

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador: [http://localhost:4321](http://localhost:4321)

### 4. Gerar Build Estático (Produção)
```bash
npm run build
```
Os arquivos prontos para produção serão gerados na pasta `./dist`.

---

## 🌐 Como Publicar (Deploy)

O projeto é 100% estático (Static Site Generation - SSG), podendo ser hospedado gratuitamente:

### Cloudflare Pages
1. Conecte seu repositório no Cloudflare Pages.
2. Definições de compilação:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

### Vercel
1. Importe o projeto na Vercel.
2. A Vercel detecta Astro automaticamente.
3. Clique em **Deploy**.

---

## 📐 Estrutura do Código

```
├── public/
│   └── favicon.svg           # Ícone do projeto
├── src/
│   ├── components/
│   │   ├── Calculator.tsx       # Componente React principal (Dashboard reativo)
│   │   ├── InputField.tsx       # Componente de input com sufixos/prefixos
│   │   ├── PdfPreviewModal.tsx  # Modal com prévia do orçamento em papel
│   │   └── PdfQuoteTemplate.tsx # Template de alta resolução para impressão do PDF
│   ├── pages/
│   │   └── index.astro          # Página principal Astro (SSR/SSG com client:load)
│   ├── styles/
│   │   └── global.css           # Estilos globais e Tailwind CSS
│   ├── types/
│   │   └── calculator.ts        # Interfaces TypeScript
│   └── utils/
│       ├── calculations.ts      # Fórmulas matemáticas de precificação
│       ├── pdfGenerator.ts      # Integração html2canvas + jsPDF
│       └── presets.ts           # Presets de impressoras e filamentos
├── astro.config.mjs             # Configuração Astro + React + Tailwind
├── tailwind.config.mjs          # Design System e paleta de cores
└── package.json
```
