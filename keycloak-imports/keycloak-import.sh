#!/bin/bash
set -e

# Inicia o Keycloak em modo import/export se o arquivo existir
if [ -f /opt/keycloak/data/import/realm-export.json ]; then
  /opt/keycloak/bin/kc.sh start-dev --import-realm
else
  /opt/keycloak/bin/kc.sh start-dev
fi

# Aguarda Keycloak subir (ajuste o tempo se necessário)
sleep 20

# Importa o realm via CLI apenas se não existir
if ! /opt/keycloak/bin/kc.sh show-realms | grep -q 'brasilprivacy'; then
  /opt/keycloak/bin/kc.sh import --file /opt/keycloak/data/import/realm-export.json
else
  echo "Realm 'brasilprivacy' já existe, não será importado novamente."
fi

# Mantém o container rodando
wait
