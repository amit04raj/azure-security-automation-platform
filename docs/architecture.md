# Architecture

## Overview

The Azure Security Automation Platform extends the Utility Hub application with Azure-native security controls focused on identity, access control, secrets management, policy enforcement, and automated remediation.

The application runs on Azure App Service and uses a system-assigned Managed Identity to access Azure Key Vault without storing credentials in application configuration.

Azure Policy is used to enforce HTTPS access for App Service applications. The policy assignment has its own system-assigned Managed Identity, which is granted Contributor access scoped to the App Service so that policy remediation can modify the required configuration.

Terraform manages the Azure infrastructure and security configuration.

## Architecture

```text
                         Internet
                            |
                           HTTPS
                            |
                            v
                +------------------------+
                |     Azure App Service  |
                |      Utility Hub       |
                |                        |
                |  FastAPI + Gunicorn    |
                +-----------+------------+
                            |
                    System-assigned
                    Managed Identity
                            |
                 Key Vault Secrets User
                            |
                            v
                +------------------------+
                |      Azure Key Vault   |
                |                        |
                |     utility-message    |
                +------------------------+


                +------------------------+
                |      Azure Policy      |
                |                        |
                |  HTTPS-only policy     |
                +-----------+------------+
                            |
                   Policy Managed Identity
                            |
                    Contributor role
                 scoped to App Service
                            |
                            v
                +------------------------+
                |     Azure App Service  |
                |     HTTPS setting      |
                +------------------------+


                +------------------------+
                |       Terraform        |
                |                        |
                | Infrastructure as Code |
                +-----------+------------+
                            |
                            v
                 Azure Resource Manager
```

## Security Automation Design

The project demonstrates several security controls working together rather than operating as isolated features.

## Managed Identity

The App Service uses a system-assigned Managed Identity.

The application does not contain an Azure client secret, service principal secret, or Key Vault credential.

The application obtains Azure credentials through `DefaultAzureCredential` and uses the App Service identity when running in Azure.

## Role-Based Access Control

The App Service Managed Identity has the following role:

```text
Key Vault Secrets User
```

The role is scoped directly to:

```text
kv-security-auto-p4
```

This allows the application to read secrets without granting it broader access to the resource group or subscription.

The identity used for Terraform deployment has:

```text
Key Vault Secrets Officer
```

scoped to the Key Vault. This identity is separate from the application's runtime identity.

## Key Vault

Azure Key Vault stores the application's test secret:

```text
utility-message
```

The application retrieves this secret through Managed Identity.

The application exposes a controlled endpoint:

```text
GET /api/v1/security/key-vault
```

The endpoint is used to demonstrate successful identity-based access from App Service to Key Vault.

Application errors are not returned directly to the client. Key Vault failures are logged server-side and returned as a generic `503` response.

## Azure Policy

The project assigns the built-in Azure Policy:

```text
Configure App Service apps to only be accessible over HTTPS
```

The policy is assigned at the resource-group scope.

The policy ensures that App Service applications in the project are configured to require HTTPS.

## Automated Remediation

The policy assignment uses a system-assigned Managed Identity.

That identity receives:

```text
Contributor
```

scoped specifically to the App Service.

An Azure Policy remediation resource is created through Terraform.

The remediation can discover existing non-compliant resources and apply the policy configuration.

The remediation resource is explicitly dependent on the required RBAC assignment.

## Policy and Application Identities

The application identity and policy identity are intentionally separate.

```text
App Service Managed Identity
        |
        +--> Key Vault Secrets User
                    |
                    +--> Key Vault


Policy Assignment Managed Identity
        |
        +--> Contributor
                    |
                    +--> App Service
```

This separation prevents the application's runtime identity from also being responsible for Azure Policy remediation.

## App Service

The Utility Hub application runs on:

```text
Azure App Service
Name: app-security-automation-platform
OS: Linux
Python: 3.12
SKU: B1
```

The application uses:

```text
gunicorn --bind=0.0.0.0:8000 --worker-class uvicorn.workers.UvicornWorker app.main:app
```

HTTPS-only access is enabled.

Minimum TLS version:

```text
TLS 1.2
```

Basic FTP and Web Deploy publishing authentication are disabled.

## Infrastructure as Code

Terraform manages:

- Resource Group
- App Service Plan
- App Service
- System-assigned Managed Identity
- Key Vault
- Key Vault secret
- RBAC assignments
- Azure Policy assignment
- Policy remediation

The infrastructure is maintained as declarative configuration rather than being created manually through the Azure Portal.

## CI/CD

GitHub Actions provides application CI/CD.

The workflow performs:

1. Source checkout
2. Python 3.12 setup
3. Dependency installation
4. Automated tests
5. Azure authentication using OIDC
6. App Service deployment
7. Application health verification

GitHub Actions uses Azure federated identity authentication rather than storing a client secret in GitHub.

## Verification

The following controls are verified independently.

### Application

```text
GET /health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "azure-security-automation-platform"
}
```

### Key Vault

```text
GET /api/v1/security/key-vault
```

Expected behavior:

- App Service authenticates using Managed Identity.
- Key Vault returns the `utility-message` secret.
- Application returns the retrieved value.

### HTTPS Policy

The App Service reports:

```text
HTTPS Only = True
```

Azure Policy reports the application as compliant.

### Terraform

Terraform validation includes:

```text
terraform fmt
terraform validate
terraform plan
```

The final plan should report:

```text
No changes. Your infrastructure matches the configuration.
```
