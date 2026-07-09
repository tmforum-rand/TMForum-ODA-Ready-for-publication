# Example Party Management component

This is an example implementation of a [TM Forum Party Management](https://www.tmforum.org/oda/directory/components-map/party-management/TMFC028) component (TMFC028).

This folder is the Helm Chart package which you distribute or host in a Helm Chart Repository. The source code is available at [../../source/PartyManagement](/source/PartyManagement/). The source README contains all the implementation documentation.

## Functionality

### Core function

In its **core function** it implements:
* The *mandatory* TMF632 Party Management Open API, providing CRUD operations for `Individual` and `Organization` resources plus a hub endpoint for event subscriptions.

It has the following dependent APIs:
* The *mandatory* dependency on TMF669 Party Role Management Open API v5 — used to validate the `engagedParty.href` reference for party role entities.

### Management function

In its **management function** it implements:
* An open metrics endpoint that counts business events (Individual and Organization create/update/delete). The Prometheus query to graph organization creation events is:
  ```
  rate(r1_partymanagement_api_counter{NotificationEvent="OrganizationCreateEvent"}[5m])
  ```

* Outbound Open Telemetry events. Configure in `values.yaml`:
  ```yaml
  api:
    otlp:
      console:
        enabled: false
      protobuffCollector:
        enabled: true
        url: http://observability-opentelemetry-collector.monitoring.svc.cluster.local:4318/v1/traces
  ```

### Security function

In its **security function** it declares a static role managed by the ODA Canvas and it exposes no role management APIs.

## Microservices

The implementation consists of 5 microservices:

* **partyManagementMicroservice** — implements the TMF632 Party Management Open API (Individual and Organization resources).
* **permissionSpecificationSetMicroservice** / **partyRoleMicroservice** — role management microservice (TMF672 or TMF669, conditional on `permissionspec.enabled`).
* **roleInitializationMicroservice** — bootstraps the initial `canvasRole` PermissionSpecificationSet/PartyRole. Deployed as a Kubernetes Job that runs once on initialisation.
* **openMetricsMicroservice** — implements the open metrics API, counts business events published by the Party Management API.
* **partyManagementInitializationMicroservice** — registers the metrics microservice as a listener on the Party Management hub. Deployed as a Kubernetes Job that runs once on initialisation.
* **MongoDB** — shared document store for all microservices.

## Installation

Install this component (assuming `kubectl` is connected to a Kubernetes cluster with an operational ODA Canvas):

```
helm install r1 .\partymanagement -n components
```

Verify the deployment:

```
kubectl get components -n components
```

Expected output (DEPLOYMENT_STATUS cycles through interim states during deploy):

```
NAME                  DEPLOYMENT_STATUS
r1-partymanagement    Complete
```

If the deployment fails, refer to the [Troubleshooting Guide](https://github.com/tmforum-oda/oda-ca-docs/tree/master/Troubleshooting-Guide).

## Configuration

You can configure the component by editing `values.yaml` or using `--set` on the command line.

To use the TMF669 Party Role API instead of TMF672:

```
helm install r1 .\partymanagement --set permissionspec.enabled=false -n components
```

### Configuration reference

| Variable Name | Default | Explanation |
|---|---|---|
| `mongodb.port` | `27017` | Port for the MongoDB instance (host derived from release name) |
| `mongodb.database` | `tmf` | Database name |
| `api.image` | `lesterthomas/partymanagementapi:0.1` | Docker image for the Party Management API microservice |
| `api.otlp.console.enabled` | `false` | Log OpenTelemetry traces to console |
| `api.otlp.protobuffCollector.enabled` | `true` | Send OpenTelemetry traces to the OTLP collector |
| `api.otlp.protobuffCollector.url` | `http://observability-opentelemetry-collector...` | OTLP collector endpoint URL |
| `metrics.image` | `lesterthomas/partymanagementmetrics:0.1` | Docker image for the open metrics microservice |
| `permissionspec.enabled` | `true` | Use TMF672 PermissionSpecificationSet API (set `false` for TMF669 PartyRole) |
| `permissionspec.image` | `lesterthomas/permissionspecapi:0.20` | Docker image for the TMF672 role management microservice |
| `partyrole.image` | `lesterthomas/partyroleapi:1.1` | Docker image for the TMF669 role management microservice |

# ODA Canvas

To know more about the ODA Canvas visit: https://github.com/tmforum-oda/oda-canvas