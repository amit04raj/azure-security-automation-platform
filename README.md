# Azure Security Automation Platform

A Terraform-managed Azure platform demonstrating managed identity, RBAC, Key Vault integration, Azure Policy enforcement, automated remediation, secure App Service configuration, and OIDC-based CI/CD.

## Project Objective

This project evolves the Utility Hub workload into a security-focused Azure platform.

The primary objectives are:

- System-assigned Managed Identity
- Azure RBAC and scoped access
- Azure Key Vault
- Azure Policy enforcement
- Policy-based automated remediation
- HTTPS and TLS hardening
- Infrastructure as Code with Terraform
- Automated testing and deployment with GitHub Actions
- GitHub Actions OIDC authentication without a stored Azure client secret

The application workload remains intentionally simple. The focus of this project is the **security controls and automation surrounding the workload**.

---

## Architecture

```text
                         USER
                           |
                         HTTPS
                           |
                           v
                +-----------------------+
                |    Azure App Service  |
                |      Utility Hub      |
                | app-security-automation|
                |       -platform       |
                +-----------+-----------+
                            |
                    System-Assigned MI
                            |
                            v
                +-----------------------+
                |      Azure Key Vault  |
                |   RBAC Authorization  |
                +-----------------------+
                            ^
                            |
                  Key Vault Secrets User
                            |
                            |
       +--------------------+--------------------+
       |                                         |
       |                                  Azure Policy
       |                              HTTPS-only policy
       |                                         |
       |                                  Policy MI
       |                                         |
       |                                   Contributor
       |                                  App Service scope
       |                                         |
       |                                  Remediation
       +-----------------------------------------+

GitHub Actions
      |
      | OIDC
      v
Entra deployment identity
      |
      | Website Contributor
      v
App Service only
```

The application runtime identity and the GitHub Actions deployment identity are separate.

The Azure Policy assignment also has its own system-assigned identity used for remediation.

---

## Security Automation Design

The project demonstrates three distinct identity paths.

### Application Identity

The App Service uses a system-assigned managed identity.

Its access is limited to:

```text
Key Vault Secrets User
```

at the Key Vault scope.

The application does not contain a Key Vault password, access key, or client secret.

### Policy Remediation Identity

The Azure Policy assignment uses a separate system-assigned managed identity.

The built-in HTTPS-only policy uses the `Modify` effect. The remediation identity is granted:

```text
Contributor
```

at the App Service resource scope.

This is deliberately scoped to the individual App Service rather than the resource group or subscription.

The role is broader than the application identity's Key Vault role because the built-in policy remediation requires resource write permissions.

### CI/CD Identity

GitHub Actions uses a dedicated Microsoft Entra application and service principal.

Authentication uses GitHub Actions OpenID Connect.

The deployment identity receives:

```text
Website Contributor
```

at the App Service resource scope only.

No long-lived Azure client secret is stored in the GitHub repository.

---

## Managed Identity

The App Service has a system-assigned managed identity.

The identity is used by the application to authenticate to Azure Key Vault through `DefaultAzureCredential`.

The application requests the secret:

```text
utility-message
```

from the configured Key Vault.

The deployed endpoint:

```text
GET /api/v1/security/key-vault
```

returns the Key Vault secret only after Azure authentication and RBAC authorization succeed.

This provides a practical demonstration of workload identity without embedding credentials in the application.

---

## Key Vault

The project uses:

```text
kv-security-auto-p4
```

The Key Vault uses Azure RBAC for its permission model.

The application managed identity is assigned:

```text
Key Vault Secrets User
```

at the Key Vault scope.

Terraform uses a separate deployment identity with:

```text
Key Vault Secrets Officer
```

at the Key Vault scope so that the demonstration secret can be provisioned.

The application runtime identity is intentionally not given permission to manage Key Vault secrets.

---

## Azure Policy

The project uses the built-in Azure Policy definition:

```text
Configure App Service apps to only be accessible over HTTPS
```

The policy is assigned at the project resource group scope.

The assignment is:

```text
enforce-app-https
```

The policy uses the `Modify` effect.

Its purpose is to enforce the HTTPS-only configuration on App Service applications in the project.

A non-compliance message is configured:

```text
App Service applications in this project must require HTTPS.
```

---

## Automated Remediation

The project includes an explicit Azure Policy remediation:

```text
remediate-app-https
```

The remediation targets existing non-compliant resources associated with the policy assignment.

The policy remediation was provisioned successfully and the final policy compliance state shows the App Service as compliant.

The final environment had no remaining non-compliant resources, so the remediation operation reported zero deployments. This is expected when there is nothing left to remediate.

This demonstrates the difference between:

```text
Policy assignment
        |
        v
Compliance evaluation
        |
        v
Remediation action
```

---

## App Service

The application runs on Azure App Service using Linux and Python 3.12.

The App Service is configured with:

- HTTPS-only access
- Minimum TLS version 1.2
- FTP basic authentication disabled
- Web Deploy basic authentication disabled
- System-assigned managed identity
- Gunicorn with Uvicorn workers
- Application logging configuration

The application workload remains the same Utility Hub used throughout the portfolio.

It provides:

- A web interface at `/`
- A health endpoint at `/health`
- A calculator API at `POST /api/v1/calculator`
- A CIDR calculation API at `POST /api/v1/cidr`
- A unit conversion API at `POST /api/v1/convert`
- A Key Vault verification endpoint at `GET /api/v1/security/key-vault`

The application remains intentionally simple so that the primary focus is the Azure security architecture and automation.

---

## Infrastructure as Code

All Azure infrastructure for this project is managed using Terraform.

Terraform provisions and manages:

- Resource Group
- App Service Plan
- Linux Web App
- System-assigned Managed Identity
- Key Vault
- Key Vault secret
- Application Managed Identity RBAC
- Terraform deployment RBAC
- Azure Policy assignment
- Policy remediation
- Policy remediation identity RBAC
- App Service security configuration

Terraform state and local variable files are excluded from source control.

The final infrastructure validation produced:

```text
No changes. Your infrastructure matches the configuration.
```

This confirms that the deployed Azure infrastructure matches the Terraform configuration.

---

## CI/CD

GitHub Actions provides automated application testing and deployment.

The workflow performs the following steps:

1. Checks out the repository
2. Sets up Python 3.12
3. Installs application dependencies
4. Runs the automated test suite
5. Authenticates to Azure using GitHub Actions OIDC
6. Deploys the application to Azure App Service
7. Verifies the application health endpoint

The GitHub Actions identity is dedicated to this project and scoped to the App Service.

Azure authentication does not use a stored client secret.

The successful deployment workflow demonstrates:

```text
Git push
   |
   v
GitHub Actions
   |
   v
Automated tests
   |
   v
OIDC authentication
   |
   v
Azure App Service deployment
   |
   v
Health verification
```

---

## Testing

The project includes automated tests using `pytest`.

The current test suite verifies:

- `/health` returns the expected health response
- The homepage loads successfully
- Calculator operations
- Division-by-zero handling
- CIDR calculation
- Unit conversion
- Application security metadata
- Key Vault access handling
- Key Vault error responses without exposing internal errors

Local automated test execution:

```text
9 passed
```

The same tests are executed by the GitHub Actions workflow before deployment.

---

## Verification Evidence

The project includes evidence covering the deployed security controls.

### Azure Resource Group

The project resource group contains the expected Azure resources.

### Managed Identity

The App Service system-assigned managed identity is enabled and has its own Azure identity.

### Key Vault

The Key Vault is configured with Azure RBAC authorization.

### Key Vault RBAC

The App Service managed identity has the:

```text
Key Vault Secrets User
```

role at the Key Vault scope.

### Azure Policy

The HTTPS-only policy is assigned to the project resource group with the `Modify` effect.

### Policy Compliance

The deployed App Service is compliant with the HTTPS-only policy.

### Policy Remediation

The remediation operation completed successfully.

### App Service Security

The App Service has:

```text
HTTPS Only: Enabled
Minimum TLS: 1.2
FTP basic authentication: Disabled
Web Deploy basic authentication: Disabled
```

### Runtime Key Vault Test

The deployed application successfully retrieved the configured Key Vault secret through its managed identity.

### GitHub Actions

The GitHub Actions workflow successfully completed:

```text
Run tests
Azure Login
Deploy to Azure Web App
Verify application health
```

### Live Application

The Utility Hub is deployed and accessible through the App Service HTTPS endpoint.

### Terraform

The final Terraform plan produced:

```text
No changes. Your infrastructure matches the configuration.
```

---

## Project Structure

```text
azure-security-automation-platform/
|
+-- app/
|   +-- main.py
|   +-- calculator.py
|   +-- cidr.py
|   +-- converter.py
|   +-- keyvault.py
|   +-- static/
|   |   +-- script.js
|   |   +-- style.css
|   |
|   +-- templates/
|       +-- index.html
|
+-- tests/
|   +-- test_api.py
|   +-- test_security.py
|
+-- terraform/
|   +-- providers.tf
|   +-- variables.tf
|   +-- main.tf
|   +-- app_service.tf
|   +-- key_vault.tf
|   +-- rbac.tf
|   +-- policy.tf
|   +-- remediation.tf
|   +-- outputs.tf
|   +-- .terraform.lock.hcl
|
+-- docs/
|   +-- architecture.md
|   +-- architecture-diagram.png
|   +-- evidence/
|
+-- .github/
|   +-- workflows/
|       +-- deploy.yml
|
+-- .gitignore
+-- .gitattributes
+-- README.md
+-- requirements.txt
```

---

## Security Principles Demonstrated

### Identity-Based Authentication

Managed Identity is used instead of embedding long-lived Azure credentials in the application.

### Least-Privilege Application Access

The application receives only the Key Vault secret permission required at the Key Vault scope.

### Separation of Identities

Application runtime, policy remediation, Terraform deployment, and GitHub Actions deployment use separate identities.

### Scoped CI/CD Access

The GitHub Actions deployment identity is restricted to the App Service rather than the resource group or subscription.

### Policy Enforcement

Azure Policy is used to enforce a security configuration rather than relying only on manual configuration.

### Automated Remediation

The policy has an explicit remediation workflow for existing non-compliant resources.

### Secure Transport

HTTPS is enforced and TLS 1.2 is configured as the minimum TLS version.

### Infrastructure as Code

Terraform provides a reproducible and reviewable representation of the Azure security configuration.

### Secret Management

Key Vault provides centralized storage for the application secret instead of placing the value in application source code.

---

## Project Scope

This project focuses on identity, access control, secrets management, policy enforcement, and security automation.

The primary areas demonstrated are:

- Managed Identity
- Azure RBAC
- Key Vault
- Azure Policy
- Policy remediation
- App Service security hardening
- Terraform
- GitHub Actions
- OIDC-based Azure authentication
- Automated testing
- Deployment verification

The project intentionally does not attempt to implement every Azure security service.

Advanced SIEM/SOAR capabilities, complex zero-trust architecture, and large-scale enterprise governance are outside the scope of this project.

---

## Project Status

The project is complete.

The deployed platform demonstrates:

```text
Identity
   |
   v
RBAC
   |
   v
Key Vault
   |
   v
Policy
   |
   v
Remediation
   |
   v
OIDC CI/CD
   |
   v
Verified Deployment
```

The Utility Hub remains intentionally simple so that the engineering progression is demonstrated through the Azure security architecture and automation rather than unnecessary application complexity.
