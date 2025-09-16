from __future__ import annotations

import os
from typing import Optional

from fastmcp import FastMCP
from starlette.responses import JSONResponse, Response

from .config import get_settings
from .logging_config import configure_logging, get_logger
from .metrics import MCP_REQUESTS, MCP_REQUEST_LATENCY
from .tools import register_tools
from grc.tools import register_grc_tools
from .resources import register_resources
from .health import healthz, readyz
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from rag.routes import register_rag_routes
from grc.routes import register_grc_routes
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from rag.db import ENGINE


def _setup_tracing() -> None:
    """Initialize OpenTelemetry tracing if enabled."""
    if os.getenv("OTEL_ENABLE", "0") == "1":
        # Create resource with service info
        resource = Resource.create({
            "service.name": os.getenv("OTEL_SERVICE_NAME", "mcp-server"),
            "service.version": "0.1.0",
            "deployment.environment": os.getenv("ENVIRONMENT", "production"),
        })
        
        # Set up tracer provider
        trace.set_tracer_provider(TracerProvider(resource=resource))
        tracer = trace.get_tracer(__name__)
        
        # Set up OTLP exporter if endpoint provided
        otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
        if otlp_endpoint:
            otlp_exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
            span_processor = BatchSpanProcessor(otlp_exporter)
            trace.get_tracer_provider().add_span_processor(span_processor)
        
        # Instrument requests and SQLAlchemy
        RequestsInstrumentor().instrument()
        SQLAlchemyInstrumentor().instrument(engine=ENGINE)
        
        return tracer
    return None


def create_app() -> FastMCP:
    configure_logging()
    settings = get_settings()
    logger = get_logger(__name__)
    
    # Initialize tracing
    tracer = _setup_tracing()

    app = FastMCP(name="mcp-server-fastmcp")

    register_tools(app)
    register_grc_tools(app)
    register_resources(app)
    register_rag_routes(app)
    register_grc_routes(app)

    logger.info("app_initialized", environment=settings.environment)

    @app.custom_route("/healthz", methods=["GET"])
    async def _health(_request):
        return JSONResponse(healthz())

    @app.custom_route("/readyz", methods=["GET"])
    async def _ready(_request):
        return JSONResponse(readyz())

    @app.custom_route("/metrics", methods=["GET"], include_in_schema=False)
    async def _metrics(_request):
        data = generate_latest()  # type: ignore[arg-type]
        return Response(content=data, media_type=CONTENT_TYPE_LATEST)

    return app


