# Example Permissions Management component

This is an example implementation of a [TM Forum Permissions Management](https://www.tmforum.org/oda/directory/components-map/party-management/TMFC035) component.

This folder is the Helm Chart package which you distribute or host in a Helm Chart Repository. This README describes the functionality of the Permissions Management component. The source code is available at [../source/PermissionsManagement](/source/PermissionsManagement/). The source file readme contains all the implementation documentation.

## Functionality

### Core function

In its **core function** it implements:
* The *mandatory* TMF672 User Roles and Permissions Open API v4 (port 8672).
* The *mandatory* TMF669 Party Role Management Open API v5 (port 8669).

It has the following dependent APIs:
* The *mandatory* dependency on TMF632 Party Management Open API v5 — used to validate party references when assigning permissions.

### Management function

In its **management function** it implements:
* An *optional* metrics API supporting the open metrics standard (formerly the prometheus de-facto standard). This metrics endpoint provides business metrics about all the Create/Update/Delete events for all the Permissions Management resources.

* Outbound Open Telemetry events. The component also generates Open-Telemetry events that can either be logged to the console or sent to an Open-Telemetry protobuffer collector. You can set this in the `values.yaml` file.

## Security function

In its **security function** it declares a static role managed by the ODA Canvas and it exposes no role management APIs.

## Microservices

The implementation consists of the following microservices:
* A `permissionsmanagement` microservice that implements the TMF672 User Roles and Permissions Open API v4 (listening on port 8672).
* A `permissionsmanagementpartyrole` microservice that implements the TMF669 Party Role Management Open API v5 (listening on port 8669).
* A `permissionsmanagementinitialization` microservice that bootstraps the initial PermissionSpecificationSet. This is deployed as a Kubernetes Job that runs once when the component is initialised.
* An `openMetrics` microservice that implements the open metrics API.
* A simple deployment of MongoDB. This is deployed as a Kubernetes Deployment with a PersistentVolumeClaim.

This reference component is intended to be used as a showcase for the ODA Component model, and to be used for testing the ODA Canvas. It is not intended for production deployments.

## Installation

Install this component (assuming the kubectl config is connected to a Kubernetes cluster with an operational ODA Canvas) using:
```
helm install r1 .\permissionsmanagement -n components
```

You can test the component has deployed successfully using
```
kubectl get components -n components
```

You should get an output like
```
NAME                           DEPLOYMENT_STATUS
r1-permissionsmanagement       Complete
```

(The DEPLOYMENT_STATUS will cycle through a number of interim states as part of the deployment).
If the deployment fails, refer to the [Troubleshooting-Guide](https://github.com/tmforum-oda/oda-ca-docs/tree/master/Troubleshooting-Guide).


## Configuration

You can configure the following aspects of the component by changing values in the `values.yaml` file, or by setting them on the command line using the `--set` parameter.

| Variable Name             | Default                                         | Explanation                                                             |
|---------------------------|-------------------------------------------------|-------------------------------------------------------------------------|
| `mongodb.port`            | 27017                                           | The port to connect to the MongoDB instance                             |
| `mongodb.database`        | tmf                                             | The database name to connect to the MongoDB instance                    |
| `api.image`               | akumartmf/permissionsmanagementv4api:0.2        | The image for the TMF672 User Roles and Permissions API microservice    |
| `api.port`                | 8672                                            | The port on which the TMF672 API microservice listens                   |
| `partyrole.image`         | akumartmf/permissionsmanagementpartyroleapiv5api:0.1 | The image for the TMF669 Party Role API microservice               |
| `partyrole.port`          | 8669                                            | The port on which the TMF669 API microservice listens                   |
| `metrics.image`           | akumartmf/openmetrics:1.0                       | The image for the open metrics microservice                             |

# ODA Canvas

To know more about the ODA Canvas visit: https://github.com/tmforum-oda/oda-canvas
