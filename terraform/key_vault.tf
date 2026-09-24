data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                = var.key_vault_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tenant_id           = data.azurerm_client_config.current.tenant_id

  sku_name = "standard"

  purge_protection_enabled   = false
  soft_delete_retention_days = 7

  rbac_authorization_enabled = true

  tags = {
    project     = "azure-security-automation-platform"
    environment = "portfolio"
    managed_by  = "terraform"
  }
}

resource "azurerm_key_vault_secret" "utility_message" {
  name         = "utility-message"
  value        = "Utility Hub accessed this secret through Managed Identity."
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [
    azurerm_role_assignment.terraform_key_vault_secrets_officer
  ]
}