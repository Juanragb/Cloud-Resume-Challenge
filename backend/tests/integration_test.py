import pytest
import json
import azure.functions as func
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
import uuid

from backend.api.function_app import http_trigger

class TestHttpTrigger:
    
    @pytest.fixture
    def setup_function_input(self):
        """Fixture para configurar los inputs básicos de la función"""
        # Mock de DocumentList
        input_doc = {
            "id": "1",
            "count": 10,
            "daily_visitors": {}
        }
        input_document = MagicMock()
        input_document.__getitem__.return_value = input_doc
        input_document.__bool__.return_value = True
        
        # Mock de Out[Document]
        output_document = MagicMock()
        
        return input_document, output_document
    
    def test_nuevo_visitante(self, setup_function_input):
        """Test para un nuevo visitante sin cookie ni header"""
        input_document, output_document = setup_function_input
        
        # Crear HttpRequest con headers vacíos
        req = func.HttpRequest(
            method='GET',
            url='http://localhost:7071/api/http_trigger',
            headers={},
            body=None
        )
        
        # Ejecutar la función
        with patch('uuid.uuid4', return_value=uuid.UUID('12345678-1234-5678-1234-567812345678')):
            response = http_trigger(req, input_document, output_document)
        
        # Verificar respuesta
        response_body = json.loads(response.get_body())
        assert response.status_code == 200
        assert response_body["visitas"] == 11  # Contador incrementado
        assert "Set-Cookie" in response.headers
        assert "visitor_id=12345678-1234-5678-1234-567812345678" in response.headers["Set-Cookie"]
        
        # Verificar que se actualizó el documento
        called_doc = output_document.set.call_args[0][0].to_dict()
        assert called_doc["count"] == 11
        assert "12345678-1234-5678-1234-567812345678" in called_doc["daily_visitors"]
    
    def test_visitante_con_cookie(self, setup_function_input):
        """Test para un visitante que ya tiene cookie"""
        input_document, output_document = setup_function_input
        
        # Añadir visitante existente al documento
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        visitor_id = "existing-visitor-123"
        input_doc = input_document[0]
        input_doc["daily_visitors"] = {visitor_id: today}
        
        # Crear HttpRequest con cookie en los headers
        headers = {"Cookie": f"visitor_id={visitor_id}"}
        req = func.HttpRequest(
            method='GET',
            url='http://localhost:7071/api/http_trigger',
            headers=headers,
            body=None
        )
        
        # Ejecutar la función
        response = http_trigger(req, input_document, output_document)
        
        # Verificar respuesta
        response_body = json.loads(response.get_body())
        assert response.status_code == 200
        assert response_body["visitas"] == 10  # No incrementa el contador (ya visitó hoy)
        assert "Set-Cookie" not in response.headers
        
        # Verificar que el documento no cambió el contador
        called_doc = output_document.set.call_args[0][0].to_dict()
        assert called_doc["count"] == 10
    
    def test_visitante_con_header(self, setup_function_input):
        """Test para un visitante que proporciona el ID mediante header"""
        input_document, output_document = setup_function_input
        
        # Configurar header pero sin visita previa
        visitor_id = "header-visitor-456"
        headers = {"Visitor-ID": visitor_id}
        req = func.HttpRequest(
            method='GET',
            url='http://localhost:7071/api/http_trigger',
            headers=headers,
            body=None
        )
        
        # Ejecutar la función
        response = http_trigger(req, input_document, output_document)
        
        # Verificar respuesta
        response_body = json.loads(response.get_body())
        assert response.status_code == 200
        assert response_body["visitas"] == 11  # Contador incrementado
        assert "Set-Cookie" in response.headers
        
        # Verificar que se actualizó el documento
        called_doc = output_document.set.call_args[0][0].to_dict()
        assert called_doc["count"] == 11
        assert visitor_id in called_doc["daily_visitors"]
    
    def test_visitante_regresa_otro_dia(self, setup_function_input):
        """Test para un visitante que regresa otro día"""
        input_document, output_document = setup_function_input
        
        # Añadir visitante existente pero con fecha anterior
        visitor_id = "returning-visitor-789"
        input_doc = input_document[0]
        input_doc["daily_visitors"] = {visitor_id: "2023-01-01"}
        
        # Crear HttpRequest con cookie en los headers
        headers = {"Cookie": f"visitor_id={visitor_id}"}
        req = func.HttpRequest(
            method='GET',
            url='http://localhost:7071/api/http_trigger',
            headers=headers,
            body=None
        )
        
        # Ejecutar la función
        response = http_trigger(req, input_document, output_document)
        
        # Verificar respuesta
        response_body = json.loads(response.get_body())
        assert response.status_code == 200
        assert response_body["visitas"] == 11  # Contador incrementado (nuevo día)
        
        # Verificar que se actualizó el documento con la fecha actual
        called_doc = output_document.set.call_args[0][0].to_dict()
        assert called_doc["count"] == 11
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        assert called_doc["daily_visitors"][visitor_id] == today
    
    def test_primer_documento(self, setup_function_input):
        """Test para cuando no existe documento previo"""
        _, output_document = setup_function_input
        
        # Crear HttpRequest básico
        req = func.HttpRequest(
            method='GET',
            url='http://localhost:7071/api/http_trigger',
            headers={},
            body=None
        )
        
        # Simular que no hay documento (base de datos vacía)
        empty_document_list = MagicMock()
        empty_document_list.__bool__.return_value = False
        
        # Ejecutar la función con documento vacío
        with patch('uuid.uuid4', return_value=uuid.UUID('98765432-9876-5432-9876-543298765432')):
            response = http_trigger(req, empty_document_list, output_document)
        
        # Verificar respuesta
        response_body = json.loads(response.get_body())
        assert response.status_code == 200
        assert response_body["visitas"] == 1  # Contador inicia en 1
        
        # Verificar que se creó el documento nuevo
        called_doc = output_document.set.call_args[0][0].to_dict()
        assert called_doc["id"] == "1"
        assert called_doc["count"] == 1
        assert "98765432-9876-5432-9876-543298765432" in called_doc["daily_visitors"]
    
    def test_error_interno(self, setup_function_input):
        """Test para simular un error interno"""
        input_document, output_document = setup_function_input
        
        # Crear HttpRequest básico
        req = func.HttpRequest(
            method='GET',
            url='http://localhost:7071/api/http_trigger',
            headers={},
            body=None
        )
        
        # Forzar que input_document genere una excepción
        input_document.__getitem__.side_effect = Exception("Error simulado")
        
        # Ejecutar la función
        response = http_trigger(req, input_document, output_document)
        
        # Verificar respuesta de error
        response_body = json.loads(response.get_body())
        assert response.status_code == 500
        assert "error" in response_body