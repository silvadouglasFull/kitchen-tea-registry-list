# ==============================================================================
# Local Garage Single-Node Configuration Template (ADR-013 / SPEC-013)
# Copy to `docker/garage/garage.toml` and replace secrets before starting.
# ==============================================================================

metadata_dir = "/var/lib/garage/meta"
data_dir = "/var/lib/garage/data"
db_engine = "sqlite"

replication_factor = 1

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "127.0.0.1:3901"
# Generate with: openssl rand -hex 32
rpc_secret = "replace-with-32-byte-hex-secret-generated-by-openssl-rand-hex-32"

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
root_domain = ".s3.garage.localhost"
public_endpoint = "http://localhost:3900"

[s3_web]
bind_addr = "[::]:3902"
root_domain = ".web.garage.localhost"
index = "index.html"

[admin]
api_bind_addr = "[::]:3903"
# Generate with: openssl rand -base64 32
admin_token = "replace-with-base64-secret-generated-by-openssl-rand-base64-32"
metrics_token = "replace-with-base64-secret-generated-by-openssl-rand-base64-32"