import os
import logging

from azure.monitor.opentelemetry import configure_azure_monitor

if os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING"):
    print("Application Insights: connection string detected")
    configure_azure_monitor()
    print("Application Insights: configure_azure_monitor completed")
else:
    print("Application Insights: connection string not detected")

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel


from app.calculator import calculate
from app.cidr import calculate_cidr
from app.converter import convert_units
from app.keyvault import get_secret

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Azure Security Automation Platform",
    description="A cloud security automation demonstration platform.",
    version="1.0.0",
)


app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static",
)

templates = Jinja2Templates(directory="app/templates")


class CalculatorRequest(BaseModel):
    operation: str
    a: float
    b: float


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={},
    )


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "azure-security-automation-platform",
    }


@app.post("/api/v1/calculator")
def calculator(request: CalculatorRequest):
    try:
        result = calculate(
            request.operation,
            request.a,
            request.b,
        )

        return {
            "operation": request.operation,
            "a": request.a,
            "b": request.b,
            "result": result,
        }

    except ValueError as error:
        logger.warning(
            "calculator_request_rejected",
            extra={
                "event": "calculator_request_rejected",
                "operation": request.operation,
                "reason": "invalid_operation_or_input",
            },
        )

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@app.post("/api/v1/cidr")
def cidr_calculate(cidr: str):
    try:
        return calculate_cidr(cidr)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@app.post("/api/v1/convert")
def convert(
    category: str,
    from_unit: str,
    to_unit: str,
    value: float,
):
    try:
        result = convert_units(
            category,
            from_unit,
            to_unit,
            value,
        )

        return {
            "category": category,
            "from_unit": from_unit,
            "to_unit": to_unit,
            "value": value,
            "result": result,
        }

    except (ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@app.get("/api/v1/security/key-vault")
def key_vault_check():
    try:
        secret = get_secret("utility-message")

        return {
            "status": "success",
            "message": secret,
        }

    except Exception:
        logger.exception("key_vault_access_failed")

        raise HTTPException(
            status_code=503,
            detail="Key Vault access is unavailable.",
        )