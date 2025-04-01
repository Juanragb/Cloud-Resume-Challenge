variable "location" {
  description = "Ubicación de los recursos en Azure"
  default     = "West Europe"
}

variable "resource_group_name" {
  description = "Nombre del grupo de recursos"
  default     = "cloud-resume-challenge"
}

variable "function_app_name" {
  description = "Nombre de la aplicación de funciones"
  default     = "get-resume-counter"
}

variable "cdn_custom_domain" {
  description = "Dominio personalizado para el CDN"
}

variable "email_notification" {
  description = "Correo electrónico para notificaciones"
}

variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}