resource "azurerm_role_assignment" "app_key_vault_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_linux_web_app.utility_hub.identity[0].principal_id
}

resource "azurerm_role_assignment" "policy_contributor" {
  scope                = azurerm_linux_web_app.utility_hub.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_resource_group_policy_assignment.https_only.identity[0].principal_id
}

resource "azurerm_role_assignment" "terraform_key_vault_secrets_officer" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}