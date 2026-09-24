variable "location" {
  description = "Azure region for the project resources."
  type        = string
  default     = "centralindia"
}

variable "resource_group_name" {
  description = "Resource group for the Azure Security Automation Platform."
  type        = string
  default     = "rg-azure-security-automation"
}

variable "app_service_name" {
  description = "Globally unique name for the Utility Hub App Service."
  type        = string
}

variable "key_vault_name" {
  description = "Globally unique name for the Key Vault."
  type        = string
}