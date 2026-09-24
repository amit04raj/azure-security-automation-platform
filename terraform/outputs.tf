output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "app_service_name" {
  value = azurerm_linux_web_app.utility_hub.name
}

output "app_service_hostname" {
  value = azurerm_linux_web_app.utility_hub.default_hostname
}

output "app_managed_identity_principal_id" {
  value = azurerm_linux_web_app.utility_hub.identity[0].principal_id
}

output "key_vault_name" {
  value = azurerm_key_vault.main.name
}

output "policy_assignment_id" {
  value = azurerm_resource_group_policy_assignment.https_only.id
}

output "policy_assignment_principal_id" {
  value = azurerm_resource_group_policy_assignment.https_only.identity[0].principal_id
}