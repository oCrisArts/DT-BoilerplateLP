# Analytics e HEART — StartTokens

## Implementação

`src/utils/analytics.ts` centraliza inicialização, contexto e distribuição para GA4 (`G-RTPS80KJ2B`), Clarity (`xbmw6k7sfz`) e Hotjar (`6735993`). Nenhum layout, preço, endpoint Stripe, banco ou Edge Function foi alterado.

`send_page_view: false` e o observador de rotas enviam um `page_view` por transição de pathname: `/`, `/privacy`, `/terms`, `/contact`, `/success`, `/cancel`. Hashes e re-renders não são novas páginas. No GA4, a medição otimizada de alterações do histórico também deve ficar desligada (configuração ajustada durante a validação).

O ScrollSpy existente identifica hero, problem-solved, presets, how-it-works, features, visual-docs, pricing e faq. Cada mudança envia `section_view`, com `section_id`, `previous_section` e `scroll_direction` (up/down/none). Atualiza o hash com replaceState, preservando estado do router e query. Reentradas contam como novas visitas à seção; `pricing_view` ocorre uma vez por visita à rota inicial.

## Eventos e contexto

| Evento | Momento |
| --- | --- |
| page_view | Entrada ou transição de rota SPA |
| section_view | Seção ativa muda no ScrollSpy |
| hero_cta_click | Clique no CTA principal do hero |
| pricing_view | Primeira entrada visível em pricing nessa visita à LP |
| pricing_click | Clique em um plano, inclusive Free |
| figma_install_click | Clique para abrir Figma Community; NÃO comprova instalação |
| faq_expand | Pergunta expandida |
| checkout_started | Resposta com URL de checkout válida recebida, antes do redirecionamento |
| checkout_success_view | Visita a /success; NÃO comprova pagamento |
| checkout_cancelled | Visita a /cancel |

Campos comuns quando disponíveis: page_path, section_id, source, medium, campaign, plan, pricing_version. UTMs persistem durante a sessão; contexto do checkout permite identificar plano e versão no retorno. Falhas de armazenamento ou dos provedores não interrompem navegação/checkout. URLs enviadas manualmente ao GA não incluem query com email/user_id.

GA recebe parâmetros por evento. Clarity recebe eventos e custom tags; Hotjar recebe eventos e atributos anônimos via Identify (sem ID pessoal). Tags/atributos descrevem estado da sessão, não equivalem a dimensões históricas por evento. Por isso eventos complementares delimitados (`section_view_pricing`, `pricing_click_new_annual`, `checkout_started_legacy_monthly`, por exemplo) preservam seção/plano nas timelines desses dois provedores. Contabilizar o funil pelos nomes base, sem somar os complementares.

No GA4, criar dimensões personalizadas de escopo evento para section_id, previous_section, scroll_direction, plan e pricing_version quando forem necessárias nas explorações. Atualizar os funis antigos dos painéis que ainda referenciam install_plugin_click/pricing_experiment_view; os eventos históricos permanecem intactos.

## Purchase: contrato preparado, envio ainda não conectado

`buildPurchaseMeasurementPayload()` é uma função pura e testada: não faz requisição nem dispara purchase no frontend. Produz o corpo do Measurement Protocol com client_id e purchase contendo transaction_id, value, currency, plan, pricing_version e items. Recebe session_id opcional para atribuição/Realtime.

Uma futura integração no servidor deve verificar a assinatura Stripe, confirmar pagamento, derivar plano/versão do Price ID real e usar valor efetivamente pago (após descontos) e moeda normalizada. Usar identificador estável da transação e idempotência nas tentativas do webhook; para recorrência, usar a fatura paga, evitando contar checkout e invoice como duas compras. Client ID/session ID deverão ser associados ao checkout para atribuição. API secret somente no servidor. Nunca usar email como client_id.

Validar inicialmente em `/debug/mp/collect`; esse endpoint valida e NÃO registra eventos. O envio definitivo é `/mp/collect` com measurement_id e api_secret do servidor. Essa conexão requer mudança futura autorizada no backend; Stripe/Supabase estão preservados nesta entrega.

## HEART

| Dimensão | Sinal / métrica | Fonte e status |
| --- | --- | --- |
| Happiness | Satisfação e feedback qualitativo; taxa de resposta | Survey/feedback no Hotjar; não criar nota de satisfação a partir de cliques |
| Engagement | Seções distintas por sessão, profundidade máxima, engaged sessions, FAQ e interações | section_view + métricas GA4; deduplicar seções por sessão para profundidade |
| Adoption | Intenção de instalar e primeira geração concluída | figma_install_click na LP; first_generation_completed exige instrumentação real futura no plugin |
| Retention | Usuários retornando, gerações repetidas por período | Métricas de retorno GA4/Clarity; repeat generations depende de eventos reais do plugin |
| Task Success | Taxa geração concluída/falhou, conclusão checkout, erros | generation_success/generation_failed/error são instrumentação futura do plugin; checkout_started → purchase verificado mede pagamento |

Não confundir interação com mockup com uso real do plugin. Não usar sucesso visual da rota como conversão financeira. Comparar o funil por pricing_version e plan, segmentando campanhas; diferenças entre versões estáticas não constituem teste A/B aleatório.

## Validação

- `npm run test:analytics`: deduplicação, rotas, contexto em três provedores, isolamento de falhas e contrato purchase.
- `npm run test:analytics:ui`: navegação SPA real, scroll/hash, FAQ/hero, checkout interceptado com falha e sucesso, mesmos eventos nos adaptadores, ausência de purchase no cliente.
- `npm run test:presets` e `npm run test:pricing`: regressões existentes, incluindo cinco combinações de preço e verify-license.
- `npm run build`: contrato de presets e bundle Vite.
- Para DebugView: abrir a LP com `?analytics_debug=1&utm_source=qa&utm_medium=validation&utm_campaign=analytics_20260922`; navegar pelas seções sem reload. Debug mode é habilitado explicitamente nessa carga.
- Verificação real em 22/09/2026: DebugView mostrou page_view, section_view, pricing_view e faq_expand. As mudanças de hash não adicionaram page_view. Checkout foi interceptado nos testes; não foi feita compra real.
- Hotjar bloqueou captura em HTTP local: console informa que só funciona em HTTPS. A confirmação de ingestão dos novos eventos depende de publicar esta versão em HTTPS; o teste local valida chamadas aos adaptadores, não ingestão.
- Clarity: painel autenticado acessível, mas a ingestão dos novos nomes ainda não foi confirmada; não confundir eventos históricos do painel com este teste.

Referências: [GA4 page views](https://developers.google.com/analytics/devguides/collection/ga4/views), [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4), [Clarity API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api).

Resultado local: 29 testes unitários aprovados; suíte analytics SPA aprovada; regressão UI aprovada nas duas versões de pricing e larguras 1920/1440/1024/768/390/320, cinco checkouts interceptados e reduced motion. A medição dos limites das abas agora aguarda a transição existente, sem alteração visual. Relatório: validation-output/report.json.
Observação do executor: validate-ui concluiu todas as assertions e gravou o relatório sem erros; seu encerramento de recursos ficou pendente e foi interrompido após a conclusão dos checks.
