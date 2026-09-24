resource "azurerm_service_plan" "main" {
  name                = "asp-security-automation"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  os_type  = "Linux"
  sku_name = "B1"

  tags = {
    project     = "azure-security-automation-platform"
    environment = "portfolio"
    managed_by  = "terraform"
  }
}

resource "azurerm_linux_web_app" "utility_hub" {
  name                = var.app_service_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

  client_affinity_enabled = true

  ftp_publish_basic_authentication_enabled       = false
  webdeploy_publish_basic_authentication_enabled = false

  app_settings = {
    KEY_VAULT_URL                  = azurerm_key_vault.main.vault_uri
    SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
  }

  identity {
    type = "SystemAssigned"
  }

  https_only = true

  logs {
    detailed_error_messages = false
    failed_request_tracing  = false

    http_logs {
      file_system {
        retention_in_days = 3
        retention_in_mb   = 100
      }
    }
  }

  site_config {
    minimum_tls_version = "1.2"

    always_on  = false
    ftps_state = "FtpsOnly"

    ip_restriction_default_action     = "Allow"
    scm_ip_restriction_default_action = "Allow"

    app_command_line = "gunicorn --bind=0.0.0.0:8000 --worker-class uvicorn.workers.UvicornWorker app.main:app"

    application_stack {
      python_version = "3.12"
    }
  }

  tags = {
    project     = "azure-security-automation-platform"
    workload    = "utility-hub"
    environment = "portfolio"
    managed_by  = "terraform"
  }
}