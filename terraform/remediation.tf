resource "azurerm_resource_group_policy_remediation" "https_only" {
  name                 = "remediate-app-https"
  resource_group_id    = azurerm_resource_group.main.id
  policy_assignment_id = azurerm_resource_group_policy_assignment.https_only.id

  depends_on = [
    azurerm_role_assignment.policy_contributor
  ]
}