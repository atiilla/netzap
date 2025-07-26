# NetZap Scan API

This API provides network scanning capabilities using the ZMap SDK. The API interfaces with a backend service that runs the ZMap scanner.

## Endpoints

### Main Scan Endpoint

`POST /api/scan`

This endpoint initiates a network scan using ZMap.

#### Request Body

```json
{
  "target_port": 80,
  "subnets": ["192.168.1.0/24", "10.0.0.0/24"],
  "output_file": "/path/to/output.txt",
  "blocklist_file": "/path/to/blocklist.txt",
  "allowlist_file": "/path/to/allowlist.txt",
  "bandwidth": "10M",
  "probe_module": "tcp_synscan",
  "rate": 10000,
  "seed": 1234,
  "verbosity": 3,
  "return_results": true
}
```

#### Parameters

- `target_port` (optional): The port number to scan. Default: 80.
- `subnets` (required): List of subnets to scan in CIDR notation.
- `output_file` (optional): Path to save the scan results.
- `blocklist_file` (optional): Path to a file containing IP addresses/subnets to exclude.
- `allowlist_file` (optional): Path to a file containing IP addresses/subnets to include.
- `bandwidth` (optional): Bandwidth cap for the scan (e.g., "10M").
- `probe_module` (optional): Probe module to use. Default: "tcp_synscan".
- `rate` (optional): Packets per second to send. Default: 0 (unlimited).
- `seed` (optional): Random seed for the scan. Default: 0.
- `verbosity` (optional): Verbosity level. Default: 0.
- `return_results` (optional): Whether to return results directly in the response. Default: true.

#### Response

```json
{
  "success": true,
  "scanId": "5f8d5e7c-9b0d-4c3a-8b0f-5e7c9b0d4c3a",
  "results": [...],
  "count": 10,
  "outputFile": "/path/to/output.txt"
}
```

### Test Connection

`GET /api/scan/test`

This endpoint checks connectivity with the ZMap backend service.

#### Response

```json
{
  "status": "success",
  "connected": true,
  "backend_info": {
    "name": "ZMap SDK API",
    "version": "1.0.0",
    "description": "REST API for ZMap network scanner"
  }
}
```

### List Probe Modules

`GET /api/scan/modules`

This endpoint retrieves available probe modules from the ZMap backend.

#### Response

```json
{
  "status": "success",
  "probe_modules": [
    "tcp_synscan",
    "icmp_echo",
    "udp"
  ]
}
```

### Create Blocklist

`POST /api/scan/blocklist`

This endpoint creates a blocklist file for use in scans.

#### Request Body

```json
{
  "subnets": ["192.168.1.0/24", "10.0.0.0/8"],
  "output_file": "/path/to/blocklist.txt"
}
```

#### Response

```json
{
  "success": true,
  "file_path": "/path/to/blocklist.txt",
  "message": "Blocklist file created with 2 subnets"
}
```

### Create Standard Blocklist

`GET /api/scan/blocklist`

This endpoint creates a standard blocklist file that excludes reserved IP ranges.

#### Response

```json
{
  "success": true,
  "file_path": "/path/to/standard_blocklist.txt",
  "message": "Standard blocklist file created"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad request (missing or invalid parameters)
- 500: Server error (scan execution failed)

Error responses include an error message:

```json
{
  "error": "Error message"
}
``` 