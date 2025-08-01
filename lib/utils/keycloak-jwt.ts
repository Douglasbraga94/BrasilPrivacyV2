import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Função utilitária para validar o JWT do Keycloak
export function validateKeycloakJWT(token: string | undefined): { valid: boolean; payload?: any } {
  if (!token) return { valid: false }
  try {
    // O segredo/certificado público do Keycloak deve ser configurado corretamente
    // Para produção, use o JWKS endpoint do Keycloak
    const decoded = jwt.decode(token, { complete: true })
    // Aqui você pode validar claims, expiração, issuer, audience, etc.
    // Exemplo simples (não seguro para produção!):
    if (!decoded) return { valid: false }
    // TODO: Validar assinatura usando JWKS
    return { valid: true, payload: decoded }
  } catch {
    return { valid: false }
  }
}
