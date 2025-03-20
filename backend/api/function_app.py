import azure.functions as func
import logging
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.function_name(name="http_trigger")
@app.route(route="http_trigger")
@app.cosmos_db_input(arg_name="inputDocument", database_name="resume-db", container_name="resume-container", id="1", partition_key="1", connection="ConnectionString")
@app.cosmos_db_output(arg_name="outputDocument", database_name="resume-db", container_name="resume-container", connection="ConnectionString")
def http_trigger(req: func.HttpRequest, inputDocument: func.DocumentList, outputDocument: func.Out[func.Document]) -> func.HttpResponse:
    logging.info("Azure Function ejecutada: actualización de contador")

    try:
        visitas_actuales = inputDocument[0].get("count", 0) if inputDocument else 0
        nuevas_visitas = visitas_actuales + 1

        outputDocument.set(func.Document.from_dict({
            "id": "1",
            "count": nuevas_visitas
        }))

        return func.HttpResponse(
            json.dumps({"visitas": nuevas_visitas}),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        logging.error(f"Error actualizando el contador: {e}")
        return func.HttpResponse("Error interno", status_code=500)
