FROM quay.io/keycloak/keycloak:24.0.3
COPY keycloak-imports/keycloak-import.sh /opt/keycloak/data/import/keycloak-import.sh
COPY keycloak-imports/realm-export.json /opt/keycloak/data/import/realm-export.json
COPY keycloak-imports/themes /opt/keycloak/themes
ENTRYPOINT ["/opt/keycloak/data/import/keycloak-import.sh"]
