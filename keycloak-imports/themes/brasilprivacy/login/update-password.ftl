<#-- update-password.ftl para tema customizado Keycloak -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atualizar Senha - BrasilPrivacy</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f9fafb; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 8px 32px 0 rgba(31,38,135,0.10); padding: 40px 32px 24px 32px; max-width: 400px; width: 100%; }
    .card-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; text-align: center; }
    .form { display: flex; flex-direction: column; gap: 18px; margin-top: 18px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .label { font-size: 1rem; font-weight: 500; color: #0f172a; margin-bottom: 2px; }
    .input { width: 100%; height: 48px; padding: 0 16px; background: #f1f5f9; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 1rem; color: #0f172a; outline: none; }
    .input:focus { border-color: #2563eb; }
    .submit-button { width: 100%; height: 48px; background: linear-gradient(90deg, #2563eb, #7c3aed); color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 1.1rem; cursor: pointer; margin-top: 8px; }
    .kc-feedback-text { color: #e11d48; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; font-size: 1rem; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-title">Atualizar Senha</div>
    <#if message?? && message.summary??>
      <div class="kc-feedback-text">${message.summary}</div>
    </#if>
    <form id="kc-passwd-update-form" class="form" action="${url.loginAction}" method="post">
      <div class="form-group">
        <label for="password-new" class="label">Nova senha</label>
        <input id="password-new" name="password-new" type="password" class="input" placeholder="Digite a nova senha" required autofocus>
      </div>
      <div class="form-group">
        <label for="password-confirm" class="label">Confirme a nova senha</label>
        <input id="password-confirm" name="password-confirm" type="password" class="input" placeholder="Confirme a nova senha" required>
      </div>
      <button type="submit" class="submit-button">Salvar</button>
    </form>
  </div>
</body>
</html>
