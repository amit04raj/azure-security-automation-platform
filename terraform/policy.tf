data "azurerm_policy_definition" "https_only" {
  display_name = "Configure App Service apps to only be accessible over HTTPS"
}

resource "azurerm_resource_group_policy_assignment" "https_only" {
  name                 = "enforce-app-https"
  resource_group_id    = azurerm_resource_group.main.id
  policy_definition_id = data.azurerm_policy_definition.https_only.id

  location = azurerm_resource_group.main.location

  identity {
    type = "SystemAssigned"
  }

  non_compliance_message {
    content = "App Service applications in this project must require HTTPS."
  }
}