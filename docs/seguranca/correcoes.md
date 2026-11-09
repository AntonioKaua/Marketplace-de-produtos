# Revisão dos avisos do Semgrep

## Evidência inicial

Fontes: `antes/resultado.json` e `antes/execucao.txt`, Semgrep 1.184.0.
A execução registrou 114 arquivos, 137 regras executadas e nenhum achado de segurança.

## Leitura parcial de Home.jsx

- Tipo: `PartialParsing`, código 3, nível `warn`.
- Local: `frontend/src/pages/Home.jsx`, linha 43.
- Trecho indicado pelo analisador: `& Selling.`.
- Correção: substituição do caractere `&` por `&amp;` no texto JSX.
- Efeito esperado: o navegador continua exibindo `Digital Trading & Selling.`, usando a entidade HTML para representar o caractere.
- Classificação: aviso de interpretação do código pelo analisador, não uma vulnerabilidade confirmada.
- Validação definitiva: repetir o Semgrep e confirmar que o aviso deixou de constar em `errors`.

## Limite interno da análise de Checkout.jsx

O JSON original também contém uma ocorrência em `time.fixpoint_timeouts`, fora de `errors`:

- Tipo: `Fixpoint timeout`, nível `warn`.
- Local: `frontend/src/pages/Checkout.jsx:15:24`.
- Regra: `javascript.lang.security.detect-eval-with-expression.detect-eval-with-expression`.
- Significado: o analisador atingiu seu limite interno de convergência durante a análise de fluxo de dados. Isso limita a análise dessa regra e não indica que foi encontrado uso de `eval`.
- Tratamento: repetir a execução e verificar também `time.fixpoint_timeouts`. Se persistir, investigar o comportamento da regra/versão antes de alterar a aplicação ou excluir a regra.

O Excel inicial contabiliza o aviso de `errors`; esta revisão acrescenta o aviso encontrado nos dados de processamento de `time`.

## Validação após a alteração

O build de produção do frontend (`node node_modules/vite/bin/vite.js build`) passou. A leitura do arquivo com o parser JSX também passou e confirmou que o texto decodificado continua contendo `Digital Trading & Selling.`. `git diff --check` não apontou problemas de whitespace.

A tentativa executada pelo Codex falhou com erro de comunicação RPC do `semgrep-core`, antes de analisar os arquivos. Os registros foram preservados em `depois/execucao-tentativa-falhou.txt` e `depois/resultado-tentativa-falhou.txt`. Eles não são evidência de aprovação da correção.

Para repetir no CMD que já executou a análise com sucesso, na raiz do projeto:

```cmd
docs\seguranca\validar.cmd
```

O script salva a versão, a saída do terminal e o JSON em `depois`. Utiliza os mesmos conjuntos de regras orientados na análise inicial e acrescenta a exclusão de `outputs`, pasta de artefatos gerados. Os arquivos de `antes` são preservados. A ausência de avisos precisa ser confirmada no novo JSON; uma mensagem de execução concluída sozinha não comprova que todos os arquivos foram interpretados integralmente.

## Resultado da execução no CMD do usuário

A execução posterior concluiu com código de saída 0. A conferência de `depois/resultado.json` confirmou:

| Indicador | Antes | Depois |
| --- | --- | --- |
| Versão | 1.184.0 | 1.184.0 |
| Arquivos analisados | 114 | 114 |
| Regras executadas (log) | 137 | 137 |
| Achados de segurança | 0 | 0 |
| Avisos em `errors` | 1 | 0 |
| Ocorrências em `time.fixpoint_timeouts` | 1 | 0 |
| Linhas interpretadas (aprox., log) | 99,9% | 100,0% |

O aviso de leitura parcial não reapareceu após a alteração de `Home.jsx`. O limite interno de análise de `Checkout.jsx` também não reapareceu nesta execução, sem alteração específica para ele. Isso não demonstra que o limite interno nunca poderá ocorrer novamente.

O log posterior informa 10 exclusões por padrões, contra 1 no anterior; a segunda execução exclui também `outputs` e os artefatos gerados. O conjunto de caminhos analisados pode ser conferido em `paths.scanned` de cada JSON. Os caracteres ilegíveis na exibição original do CMD são um problema de codificação do terminal. O script foi ajustado para usar a página de código UTF-8, sem modificar as evidências já produzidas.
