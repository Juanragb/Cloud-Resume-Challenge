import azure.functions as func
import logging
import json
import uuid
from datetime import datetime, timedelta, timezone

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.function_name(name="http_trigger")
@app.route(route="http_trigger", methods=[func.HttpMethod.GET])
@app.cosmos_db_input(arg_name="inputDocument", database_name="counter-visit-db", container_name="counter-visit-container", id="1", partition_key="1", connection="ConnectionString")
@app.cosmos_db_output(arg_name="outputDocument", database_name="counter-visit-db", container_name="counter-visit-container", connection="ConnectionString")
def http_trigger(req: func.HttpRequest, inputDocument: func.DocumentList, outputDocument: func.Out[func.Document]) -> func.HttpResponse:
    logging.info("Azure Function ejecutada: contador de visitas únicas")
    
    try:
        counter_data = inputDocument[0] if inputDocument else {
            "id": "1",
            "count": 0,
            "daily_visitors": {}
        }
        
        visitor_id = None
        cookie_header = req.headers.get("Cookie", "")
        visitor_id_header = req.headers.get("Visitor-ID")
        
        visitor_id = None
        for cookie in cookie_header.split(";"):
            if cookie.strip().startswith("visitor_id="):
                visitor_id = cookie.split("=")[1].strip()
                break

        if not visitor_id and visitor_id_header:
            visitor_id = visitor_id_header

        if not visitor_id:
            visitor_id = str(uuid.uuid4())
        
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        daily_visitors = counter_data.get("daily_visitors", {})
        if visitor_id not in daily_visitors or daily_visitors[visitor_id] != today:
            counter_data["count"] += 1
            daily_visitors[visitor_id] = today
            counter_data["daily_visitors"] = daily_visitors
        
        outputDocument.set(func.Document.from_dict(counter_data))

        response = func.HttpResponse(
            json.dumps({
                "visitas": counter_data["count"],
                "es_nuevo_visitante": visitor_id not in daily_visitors
            }),
            mimetype="application/json",
            status_code=200
        )
        
        if not cookie_header or "visitor_id=" not in cookie_header:
            response.headers["Set-Cookie"] = (
                f"visitor_id={visitor_id}; "
                f"Expires={(datetime.now(timezone.utc) + timedelta(days=30)).strftime('%a, %d %b %Y %H:%M:%S GMT')}; "
                "HttpOnly; Secure; SameSite=Lax"
            )
        
        return response

    except Exception as e:
        logging.error(f"Error: {str(e)}", exc_info=True)
        return func.HttpResponse(
            json.dumps({"error": "Internal Server Error"}),
            status_code=500,
            mimetype="application/json"
        )