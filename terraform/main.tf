terraform {
  required_version = ">= 1.5.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_droplet" "app" {
  image    = "docker-20-04"
  name     = var.droplet_name
  region   = var.region
  size     = var.size
  ssh_keys = var.ssh_key_fingerprints
  tags     = ["skypulse", "backend-assignment"]
}

output "droplet_ip" {
  description = "Public IPv4 address of the SkyPulse droplet"
  value       = digitalocean_droplet.app.ipv4_address
}
