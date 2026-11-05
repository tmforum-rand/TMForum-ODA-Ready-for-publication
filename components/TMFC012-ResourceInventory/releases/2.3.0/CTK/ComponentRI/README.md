# Example Resource Inventory Management component

This is an example implementation of a [TM Forum Resource Inventory Management](https://www.tmforum.org/oda/directory/components-map/production/TMFC012) component.

This folder is the Helm Chart package which you distribute or host in a Helm Chart Repository. This README describes the functionality of the Resource Inventory Management component. The source code is available at [../source/ResourceInventoryManagement](/source/ResourceInventoryManagement/). The source file readme contains all the implementation documentation.

## Functionality

### Core function

In its **core function** it implements:
* The *mandatory* TMF639 Resource Inventory Management Open API v4.

It has the following dependent APIs:
* The *mandatory* dependency on TMF634 Resource Catalog Management Open API v5 — used to query resource specifications for enriching resource inventory data.

### Management function

In its **management function** it implements:
* An *optional* metrics API supporting the open metrics standard (formerly the prometheus de-facto standard). This metrics endpoint provides business metrics about all the Create/Update/Delete events for all the Resource Inventory resources (LogicalResource, PhysicalResource, etc.).

* Outbound Open Telemetry events. The component also generates Open-Telemetry events that can either be logged to the console or sent to an Open-Telemetry protobuffer collector. You can set this in the `values.yaml` file.

## Security function

In its **security function** it declares a static role managed by the ODA Canvas and it exposes no role management APIs.

## Microservices

The implementation consists of the following microservices:
* A `resourceinventorymanagement` microservice that implements the TMF639 Resource Inventory Management Open API v4.
* A `resourceinventoryinitialization` microservice that registers the metrics microservice as a listener for resource inventory business events. This is deployed as a Kubernetes Job that runs once when the component is initialised.
* An `openMetrics` microservice that implements the open metrics API.
* A simple deployment of MongoDB. This is deployed as a Kubernetes Deployment with a PersistentVolumeClaim.

This reference component is intended to be used as a showcase for the ODA Component model, and to be used for testing the ODA Canvas. It is not intended for production deployments.

## Installation

Install this component (assuming the kubectl config is connected to a Kubernetes cluster with an operational ODA Canvas) using:
```
helm install r1 .\resourceinventorymanagement -n components
```

You can test the component has deployed successfully using
```
kubectl get components -n components
```

You should get an output like
```
NAME                            DEPLOYMENT_STATUS
r1-resourceinventory            Complete
```

(The DEPLOYMENT_STATUS will cycle through a number of interim states as part of the deployment).
If the deployment fails, refer to the [Troubleshooting-Guide](https://github.com/tmforum-oda/oda-ca-docs/tree/master/Troubleshooting-Guide).


## Configuration

You can configure the following aspects of the component by changing values in the `values.yaml` file, or by setting them on the command line using the `--set` parameter.

| Variable Name         | Default                                  | Explanation                                                              |
|-----------------------|------------------------------------------|--------------------------------------------------------------------------|
| `mongodb.port`        | 27017                                    | The port to connect to the MongoDB instance                              |
| `mongodb.database`    | tmf                                      | The database name to connect to the MongoDB instance                     |
| `api.image`           | akumartmf/resourceinventoryapi:0.7       | The image for the implementation of the main API microservice            |
| `metrics.image`       | akumartmf/resourceinventorymetrics:0.1   | The image for the open metrics microservice                              |

# ODA Canvas

To know more about the ODA Canvas visit: https://github.com/tmforum-oda/oda-canvas
