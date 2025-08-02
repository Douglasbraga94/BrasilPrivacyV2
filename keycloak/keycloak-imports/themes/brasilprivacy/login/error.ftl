<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Erro - BrasilPrivacy</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f9fafb; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 8px 32px 0 rgba(31,38,135,0.10); padding: 40px 32px 24px 32px; max-width: 400px; width: 100%; text-align: center; }
    .card-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; color: #e11d48; }
    .card-description { color: #64748b; font-size: 1rem; margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-title">Ocorreu um erro</div>
    <div class="card-description">
      <#if message?? && message.summary??>
        <#if message.summary == "invalidCodeMessage">
          Código de autenticação inválido ou expirado. Por favor, tente novamente realizando o login.
        <#else>
          ${message.summary}
        </#if>
      <#else>
        Tente novamente ou contate o suporte.
      </#if>
    </div>
  </div>
</body>
</html>
