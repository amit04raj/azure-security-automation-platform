import os

from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient


def get_secret(secret_name: str) -> str:
    vault_url = os.environ["KEY_VAULT_URL"]

    credential = DefaultAzureCredential()

    client = SecretClient(
        vault_url=vault_url,
        credential=credential,
    )

    secret = client.get_secret(secret_name)
    return secret.value
