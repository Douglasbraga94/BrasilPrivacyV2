<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrasilPrivacy - Atualizar Senha</title>
  <style>
    :root {
      --background: #f9fafb;
      --card-bg: #fff;
      --card-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
      --primary: #2563eb;
      --primary-dark: #1e40af;
      --brand-blue: #2563eb;
      --brand-purple: #7c3aed;
      --input-bg: #f1f5f9;
      --input-border: #e2e8f0;
      --input-placeholder: #94a3b8;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --radius: 12px;
      --transition: 0.2s;
    }
    body {
      min-height: 100vh;
      background: var(--background);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .branding {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 32px;
    }
    .logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 18px;
      box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.10);
    }
    .logo svg {
      width: 36px;
      height: 36px;
      color: #fff;
      display: block;
    }
    .brand-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 4px;
      color: var(--text-main);
    }
    .brand-subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      font-weight: 400;
      margin-bottom: 0;
    }
    .card {
      background: var(--card-bg);
      border-radius: 16px;
      box-shadow: var(--card-shadow);
      padding: 40px 32px 24px 32px;
      max-width: 400px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    .card-header {
      text-align: center;
      margin-bottom: 18px;
    }
    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 4px;
      color: var(--text-main);
    }
    .card-description {
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 0;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-top: 18px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .label {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-main);
      margin-bottom: 2px;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 16px;
      width: 20px;
      height: 20px;
      color: var(--input-placeholder);
      pointer-events: none;
    }
    .input {
      width: 100%;
      height: 48px;
      padding: 0 16px 0 44px;
      background: var(--input-bg);
      border: 1.5px solid var(--input-border);
      border-radius: 8px;
      font-size: 1rem;
      color: var(--text-main);
      transition: border var(--transition);
      outline: none;
    }
    .input:focus {
      border-color: var(--brand-blue);
    }
    .input::placeholder {
      color: var(--input-placeholder);
      opacity: 1;
    }
    .input-password {
      padding-right: 44px;
    }
    .password-toggle {
      position: absolute;
      right: 16px;
      background: none;
      border: none;
      color: var(--input-placeholder);
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      height: 100%;
      transition: color var(--transition);
    }
    .password-toggle:hover {
      color: var(--brand-blue);
    }
    .submit-button {
      width: 100%;
      height: 48px;
      background: linear-gradient(90deg, var(--brand-blue), var(--brand-purple));
      color: #fff;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      margin-top: 8px;
      margin-bottom: 0;
      transition: background var(--transition), box-shadow var(--transition);
      box-shadow: 0 2px 8px 0 rgba(31, 38, 135, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .submit-button:hover {
      background: linear-gradient(90deg, var(--brand-purple), var(--brand-blue));
    }
    .security-notice {
      margin-top: 18px;
      text-align: center;
      font-size: 0.95rem;
      color: var(--text-muted);
    }
    .kc-feedback-text {
      color: #e11d48;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 10px;
      font-size: 1rem;
      text-align: center;
    }
    @media (max-width: 480px) {
      .card { padding: 24px 8px 16px 8px; }
      .main-content { max-width: 100vw; }
    }
  </style>
</head>
<body>
  <div class="branding">
    <div class="logo">
      <!-- Ícone de escudo -->
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="url(#paint0_linear_1_2)"/>
        <path d="M16 8L24 11V16C24 21.25 19.5 24 16 24C12.5 24 8 21.25 8 16V11L16 8Z" stroke="white" stroke-width="2"/>
        <defs>
          <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2563eb"/>
            <stop offset="1" stop-color="#7c3aed"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="brand-title">BrasilPrivacy</div>
    <div class="brand-subtitle">Sistema de Gestão LGPD</div>
  </div>
  <div class="main-content">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Atualize sua senha</div>
        <div class="card-description">Por favor, defina uma nova senha para continuar</div>
      </div>
      <#if message?? && message.summary??>
        <div class="kc-feedback-text">${message.summary}</div>
      </#if>
      <form id="kc-update-password-form" class="form" action="${url.loginAction}" method="post">
        <div class="form-group">
          <label for="password-new" class="label">Nova senha</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <!-- Ícone cadeado -->
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect width="14" height="8" x="5" y="11" rx="2"/><path d="M7 11V7a5 5 0 1110 0v4"/></svg>
            </span>
            <input id="password-new" name="password-new" type="password" class="input input-password" placeholder="Digite a nova senha" required>
          </div>
        </div>
        <div class="form-group">
          <label for="password-confirm" class="label">Confirme a nova senha</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <!-- Ícone cadeado -->
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect width="14" height="8" x="5" y="11" rx="2"/><path d="M7 11V7a5 5 0 1110 0v4"/></svg>
            </span>
            <input id="password-confirm" name="password-confirm" type="password" class="input input-password" placeholder="Confirme a nova senha" required>
          </div>
        </div>
        <button type="submit" class="submit-button" id="submit-button"><span id="button-text">Salvar nova senha</span></button>
      </form>
      <div class="security-notice">
        Protegido por criptografia de ponta a ponta em conformidade com a LGPD
      </div>
    </div>
  </div>
</body>
</html>
