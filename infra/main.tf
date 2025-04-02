# DOC: https://github.com/hashicorp/terraform-provider-azurerm

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.24.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

########################################### Resource Group #####################################################

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

########################################### Storage Accounts #####################################################

resource "azurerm_storage_account" "function_storage_account" {
  account_kind                    = "Storage"
  account_replication_type        = "LRS"
  account_tier                    = "Standard"
  location                        = azurerm_resource_group.rg.location
  name                            = "storageforcounter"
  resource_group_name             = azurerm_resource_group.rg.name
  allow_nested_items_to_be_public = false
  default_to_oauth_authentication = true
}

resource "azurerm_storage_account" "web_storage_account" {
  account_replication_type        = "LRS"
  account_tier                    = "Standard"
  location                        = azurerm_resource_group.rg.location
  name                            = "cloudresumechalleng"
  resource_group_name             = azurerm_resource_group.rg.name
  allow_nested_items_to_be_public = false
}

resource "azurerm_storage_container" "static_web_container" {
  name               = "$web"
  storage_account_id = azurerm_storage_account.web_storage_account.id
}

########################################### CosmosDB #####################################################

resource "azurerm_cosmosdb_account" "cosmosdb_account" {
  name                       = "cloud-resume-cosmos-acc"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  offer_type                 = "Standard"
  kind                       = "GlobalDocumentDB"
  capabilities {
    name = "EnableServerless"
  }
  consistency_policy {
    consistency_level = "Session"
  }
  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }
  backup {
    type = "Periodic"
    interval_in_minutes = 1440
    retention_in_hours = 48
    storage_redundancy = "Local"
  }
}

resource "azurerm_cosmosdb_sql_database" "cosmosdb_db" {
  account_name        = azurerm_cosmosdb_account.cosmosdb_account.name
  name                = "counter-visit-db"
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_cosmosdb_sql_container" "cosmosdb_container" {
  account_name        = azurerm_cosmosdb_account.cosmosdb_account.name
  database_name       = azurerm_cosmosdb_sql_database.cosmosdb_db.name
  name                = "counter-visit-container"
  partition_key_paths = ["/id"]
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_cosmosdb_sql_role_definition" "cosmos-role1" {
  account_name        = azurerm_cosmosdb_account.cosmosdb_account.name
  assignable_scopes   = [azurerm_cosmosdb_sql_database.cosmosdb_db.id]
  name                = "Cosmos DB Built-in Data Reader"
  resource_group_name = azurerm_resource_group.rg.name
  type                = "BuiltInRole"
  permissions {
    data_actions = ["Microsoft.DocumentDB/databaseAccounts/readMetadata", "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/executeQuery", "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/read", "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/readChangeFeed"]
  }
}

resource "azurerm_cosmosdb_sql_role_definition" "cosmos-role2" {
  account_name        = azurerm_cosmosdb_account.cosmosdb_account.name
  assignable_scopes   = [azurerm_cosmosdb_sql_database.cosmosdb_db.id]
  name                = "Cosmos DB Built-in Data Contributor"
  resource_group_name = azurerm_resource_group.rg.name
  type                = "BuiltInRole"
  permissions {
    data_actions = ["Microsoft.DocumentDB/databaseAccounts/readMetadata", "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*", "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*"]
  }
}

########################################### Function App #####################################################

resource "azurerm_service_plan" "asp" {
  name                = "ASP-get-resume-counter"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "Y1"
}

resource "azurerm_linux_function_app" "function_app" {
  name                       = "${var.function_app_name}-${random_string.suffix.result}"
  resource_group_name        = azurerm_resource_group.rg.name
  location                   = azurerm_resource_group.rg.location
  storage_account_name       = azurerm_storage_account.function_storage_account.name
  storage_account_access_key = azurerm_storage_account.function_storage_account.primary_access_key
  service_plan_id            = azurerm_service_plan.asp.id

  site_config {
    ftps_state = "FtpsOnly"
    application_stack {
      python_version = "3.11"
    }
    cors {
      allowed_origins     = ["https://www.juanragarcia.me"]
      support_credentials = true
    }
  }
}

resource "azurerm_function_app_function" "function" {
  function_app_id = azurerm_linux_function_app.function_app.id
  name            = "counter_http_trigger"
  config_json = jsonencode({
    bindings = [{
      direction     = "OUT"
      name          = "outputDocument"
      type          = "cosmosDB"
      }, {
      direction     = "IN"
      name          = "inputDocument"
      type          = "cosmosDB"
      }, {
      authLevel = "FUNCTION"
      direction = "IN"
      methods   = ["GET"]
      name      = "req"
      type      = "httpTrigger"
      }, {
      direction = "OUT"
      name      = "$return"
      type      = "http"
    }]
    language          = "python"
    name              = "http_trigger"
  })
}

########################################### CDN Config #####################################################

resource "azurerm_cdn_profile" "cdn_profile" {
  name                = "resume-challenge-cdn"
  location            = "Global"
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Standard_Microsoft"
}

resource "azurerm_cdn_endpoint" "cdn_endpoint" {
  name                = "resume-challenge-endpoint"
  profile_name        = azurerm_cdn_profile.cdn_profile.name
  resource_group_name = azurerm_resource_group.rg.name
  is_http_allowed     = false
  is_https_allowed    = true
  location            = "Global"
  optimization_type   = "GeneralWebDelivery"

  is_compression_enabled = true
  content_types_to_compress = ["application/eot", "application/font", "application/font-sfnt", "application/javascript", "application/json", "application/opentype", "application/otf", "application/pkcs7-mime", "application/truetype", "application/ttf", "application/vnd.ms-fontobject", "application/x-font-opentype", "application/x-font-truetype", "application/x-font-ttf", "application/x-httpd-cgi", "application/x-javascript", "application/x-mpegurl", "application/x-opentype", "application/x-otf", "application/x-perl", "application/x-ttf", "application/xhtml+xml", "application/xml", "application/xml+rss", "font/eot", "font/opentype", "font/otf", "font/ttf", "image/svg+xml", "text/css", "text/csv", "text/html", "text/javascript", "text/js", "text/plain", "text/richtext", "text/tab-separated-values", "text/x-component", "text/x-java-source", "text/x-script", "text/xml"]

  delivery_rule {
    name  = "RedirectToHTTPS"
    order = 1
    request_scheme_condition {
      match_values = ["HTTP"]
    }
    url_redirect_action {
      protocol      = "Https"
      redirect_type = "Found"
    }
  }

  origin_host_header = azurerm_storage_account.web_storage_account.primary_web_host
  origin {
    name      = "${azurerm_storage_account.web_storage_account.name}-origin"
    host_name = azurerm_storage_account.web_storage_account.primary_web_host
  }
}

resource "azurerm_cdn_endpoint_custom_domain" "cdn_custom_domain" {
  cdn_endpoint_id = azurerm_cdn_endpoint.cdn_endpoint.id
  host_name       = var.cdn_custom_domain
  name            = "www-juanragarcia-me"
  cdn_managed_https {
    certificate_type = "Dedicated"
    protocol_type    = "ServerNameIndication"
  }
}

########################################## Azure Monitor #####################################################

resource "azurerm_monitor_action_group" "action_group" {
  name                = "actiongroup1"
  resource_group_name = azurerm_resource_group.rg.name
  short_name          = "actionsfunc"

  azure_app_push_receiver {
    email_address = var.email_notification
    name          = "RateLimit_-AzureAppAction-"
  }

  email_receiver {
    email_address           = var.email_notification
    name                    = "RateLimit_-EmailAction-"
    use_common_alert_schema = true
  }
}

resource "azurerm_monitor_metric_alert" "alert" {
  description         = "Max invocations"
  name                = "Max invocations"
  resource_group_name = azurerm_resource_group.rg.name
  scopes              = [azurerm_linux_function_app.function_app.id]
  window_size         = "PT15M"

  action {
    action_group_id = azurerm_monitor_action_group.action_group.id
  }

  criteria {
    aggregation      = "Total"
    metric_name      = "FunctionExecutionCount"
    metric_namespace = "Microsoft.Web/sites"
    operator         = "GreaterThan"
    threshold        = 500
  }
}
