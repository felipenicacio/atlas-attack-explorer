# Atlas — ATT&CK Explorer

Página estática independente, sem banco de dados ou servidor de aplicação. A interface está em português; os nomes, descrições e evidências preservam o texto oficial.

## Visão da plataforma

![Página inicial do Atlas com busca, filtros, comparação de ransomware e detalhes de uma técnica](docs/images/atlas-home-preview.jpg)

[Ver a captura da página completa](docs/images/atlas-home.jpg)

## Funcionalidades

- Consulta dos domínios Enterprise, Mobile e ICS.
- Busca por nome, ID, aliases e descrição, com filtros por tática e plataforma.
- Detecção com estratégias, analíticas por plataforma e fontes de log.
- Mitigações com aplicação específica à técnica.
- Comparação de ameaças, exportação CSV e camadas para o ATT&CK Navigator.
- Guia em português em `dist/help.html` e ajuda contextual.
- Favoritos, preferências locais e tema claro/escuro.

## Abrir localmente

Após clonar este repositório, entre na pasta `dist` e execute `python -m http.server 8765 --bind 127.0.0.1` e abra http://127.0.0.1:8765. É necessário servir os arquivos por HTTP, pois módulos e carregamento dos dados não funcionam abrindo o HTML por duplo clique.

## Dados

Inclui os três domínios completos STIX 2.1, normalizados para consulta, na versão 20.0: Enterprise, Mobile e ICS. Os registros de conteúdo revogados ou descontinuados são preservados e podem ser exibidos por filtro. Identidades, marcações e metadados de coleção não aparecem como conteúdo pesquisável. Relacionamentos ativos ficam disponíveis nos detalhes.

O botão Atualizar baixa o STIX do domínio atual diretamente do repositório oficial `mitre-attack/attack-stix-data` no GitHub, normaliza em memória e mantém um cache no IndexedDB. A versão incluída continua disponível se a atualização falhar. Não usa TAXII nem proxy. Requer acesso a raw.githubusercontent.com para atualização; a consulta inicial usa os dados incluídos com a página.

Preferências, favoritos, seleção de ameaças e aparência são guardados no localStorage. Nenhum dado de usuário é enviado a um banco de dados. GitHub e hospedagem recebem as solicitações HTTP normais. Não há serviços de rastreamento.

## Comparação

Score = quantidade distinta de entidades selecionadas que possuem uma relação direta ativa `uses` com a técnica. Não há inferência transitiva grupo → ferramenta → técnica, propagação aos pais ou ponderação por incidentes. A matriz pode repetir técnicas em várias táticas. Não implica frequência real de uso. Arquivados ficam fora da pontuação e da exportação Navigator.

CSV exporta os resultados dos filtros atuais. Navigator exporta todas as relações diretas válidas das ameaças selecionadas, independentemente dos filtros visuais.

## Atualizar os dados incluídos

Baixe os três bundles oficiais para `raw/{domain}.json` e execute `node build-data.mjs`. Essa pasta não é publicada. A interface funciona sem dependências externas, bibliotecas ou etapa de compilação.

MITRE ATT&CK® é marca registrada de The MITRE Corporation. Este projeto não é oficial. A licença dos dados está em `dist/data/LICENSE-MITRE.txt`.

## Verificação

Com Node.js instalado, execute na raiz do repositório:

```sh
node --check dist/app.mjs
node --check dist/help.js
node verify.mjs
```

Os testes conferem os relacionamentos, a pontuação, a exportação e exemplos de detecção e mitigação contra os dados incluídos.

## Hospedagem

Publique o conteúdo de `dist/` em uma hospedagem de arquivos estáticos. Não é necessário instalar dependências, compilar o código ou configurar um banco de dados. Preserve a pasta `data/` e seus arquivos de relacionamentos.

Esta é uma cópia independente do código da plataforma. Alterações neste repositório não são publicadas automaticamente no Site original. Favoritos e preferências são específicos de cada navegador e endereço. As configurações privadas da hospedagem original não fazem parte desta cópia.
