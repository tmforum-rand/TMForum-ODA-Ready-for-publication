# Example Resource Configuration and Activation component

This is an example implementation of a [TM Forum Resource Configuration and Activation](https://www.tmforum.org/oda/directory/components-map/production/TMFC062) component.

This folder is the Helm Chart package which you distribute or host in a Helm Chart Repository. This README describes the functionality of the Resource Configuration and Activation component. The source code is available at [../source/ResourceConfigAndActivation-v4](/source/ResourceConfigAndActivation-v4/). The source file readme contains all the implementation documentation.

## Functionality

### Core function

In its **core function** it implements:
* The *mandatory* TMF702 Resource Activation and Configuration Open API v4.

It has the following dependent APIs:
* The *mandatory* dependency on TMF634 Resource Catalog Management Open API v5 — used to validate `resourceSpecification.href` references on POST operations to ensure the referenced resource specification exists.
* The *mandatory* dependency on TMF639 Resource Inventory Management Open API v4 — used to validate `resourceRelationship[*].resource.href` references on POST operations to ensure that related resources exist.

Additionally, the Monitor resource in this component is read-only (GET operations only). Create, update, and delete operations on Monitor are not supported.

### Management function

In its **management function** it implements:
* An *optional* metrics API supporting the open metrics standard (formerly the prometheus de-facto standard). This metrics endpoint provides business metrics about all the Create/Update/Delete events for all the Resource Activation resources (Resource, Monitor, etc.).

* Outbound Open Telemetry events. The component also generates Open-Telemetry events that can either be logged to the console or sent to an Open-Telemetry protobuffer collector. You can set this in the `values.yaml` file.

## Security function

In its **security function** it declares a static role managed by the ODA Canvas and it exposes no role management APIs.

## Microservices

The implementation consists of the following microservices:
* A `resourceconfigandactivation` microservice that implements the TMF702 Resource Activation and Configuration Open API v4.
* A `resourceconfigandactivationinitialization` microservice that registers the metrics microservice as a listener for resource activation business events. This is deployed as a Kubernetes Job that runs once when the component is initialised.
* An `openMetrics` microservice that implements the open metrics API.
* A simple deployment of MongoDB. This is deployed as a Kubernetes Deployment with a PersistentVolumeClaim.

This reference component is intended to be used as a showcase for the ODA Component model, and to be used for testing the ODA Canvas. It is not intended for production deployments.

## Installation

Install this component (assuming the kubectl config is connected to a Kubernetes cluster with an operational ODA Canvas) using:
```
helm install r1 .\resourceconfigandactivation-v4 -n components
```

You can test the component has deployed successfully using
```
kubectl get components -n components
```

You should get an output like
```
NAME                              DEPLOYMENT_STATUS
r1-resourceconfigandactivation    Complete
```

(The DEPLOYMENT_STATUS will cycle through a number of interim states as part of the deployment).
If the deployment fails, refer to the [Troubleshooting-Guide](https://github.com/tmforum-oda/oda-ca-docs/tree/master/Troubleshooting-Guide).


## Configuration

You can configure the following aspects of the component by changing values in the `values.yaml` file, or by setting them on the command line using the `--set` parameter.

| Variable Name         | Default                                              | Explanation                                                              |
|-----------------------|------------------------------------------------------|--------------------------------------------------------------------------|
| `mongodb.port`        | 27017                                                | The port to connect to the MongoDB instance                              |
| `mongodb.database`    | tmf                                                  | The database name to connect to the MongoDB instance                     |
| `api.image`           | akumartmf/resourceconfigandactivationapiv4:0.2       | The image for the implementation of the main API microservice            |
| `api.port`            | 8080                                                 | The port on which the API microservice listens                           |
| `metrics.image`       | akumartmf/resourceconfigandactivationmetricsv4:0.1   | The image for the open metrics microservice                              |

# ODA Canvas

To know more about the ODA Canvas visit: https://github.com/tmforum-oda/oda-canvas
