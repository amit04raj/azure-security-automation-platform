resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    project     = "azure-security-automation-platform"
    environment = "portfolio"
    managed_by  = "terraform"
  }
}