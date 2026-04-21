variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "droplet_name" {
  description = "Name for the application droplet"
  type        = string
  default     = "skypulse"
}

variable "region" {
  description = "DigitalOcean region for the droplet"
  type        = string
  default     = "fra1"
}

variable "size" {
  description = "Droplet size slug"
  type        = string
  default     = "s-1vcpu-1gb"
}

variable "ssh_key_fingerprints" {
  description = "SSH key fingerprints allowed to access the droplet"
  type        = list(string)
  default     = []
}
