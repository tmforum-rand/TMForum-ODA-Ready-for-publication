# Example Product Usage Management component (v5)

This is an example implementation of a [TM Forum Product Usage Management](https://www.tmforum.org/oda/directory/components-map/core-commerce-management/TMFC040) component.

This folder is the Helm Chart package which you distribute or host in a Helm Chart Repository. This README describes the functionality of the Product Usage Management component. The source code is available at [../source/ProductUsageManagement-v5](/source/ProductUsageManagement-v5/). The source file readme contains all the implementation documentation.

## Functionality

### Core function

In its **core function** it implements:
* The *mandatory* TMF635 Usage Management Open API v4.
* The *mandatory* TMF677 Usage Consumption Open API v5.

It has the following dependent APIs:
* The *mandatory* dependency on TMF632 Party Management Open API v5 — used to validate `relatedParty.href` and `partyOrPartyRole.href` references on POST operations to ensure the referenced party exists.

### Management function

In its **management function** it implements:
* An *optional* metrics API supporting the open metrics standard (formerly the prometheus de-facto standard). This metrics endpoint provides business metrics about all the Create/Update/Delete events for all the Usage Management resources (UsageReport, UsageSpecification, etc.).

* Outbound Open Telemetry events. The component also generates Open-Telemetry events that can either be logged to the console or sent to an Open-Telemetry protobuffer collector. You can set this in the `values.yaml` file.

## Security function

In its **security function** it declares a static role managed by the ODA Canvas and it exposes no role management APIs.

## Microservices

The implementation consists of the following microservices:
* A `usagemanagement` microservice that implements the TMF635 Usage Management Open API v4.
* A `usageconsumption` microservice that implements the TMF677 Usage Consumption Open API v5.
* A `productusagemanagementinitialization` microservice that registers the metrics microservice as a listener for usage business events. This is deployed as a Kubernetes Job that runs once when the component is initialised.
* An `openMetrics` microservice that implements the open metrics API.
* A simple deployment of MongoDB. This is deployed as a Kubernetes Deployment with a PersistentVolumeClaim.

This reference component is intended to be used as a showcase for the ODA Component model, and to be used for testing the ODA Canvas. It is not intended for production deployments.

## Installation

Install this component (assuming the kubectl config is connected to a Kubernetes cluster with an operational ODA Canvas) using:
```
helm install r1 .\productusagemanagement-v5 -n components
```

You can test the component has deployed successfully using
```
kubectl get components -n components
```

You should get an output like
```
NAME                             DEPLOYMENT_STATUS
r1-productusagemanagement        Complete
```

(The DEPLOYMENT_STATUS will cycle through a number of interim states as part of the deployment).
If the deployment fails, refer to the [Troubleshooting-Guide](https://github.com/tmforum-oda/oda-ca-docs/tree/master/Troubleshooting-Guide).


## Configuration

You can configure the following aspects of the component by changing values in the `values.yaml` file, or by setting them on the command line using the `--set` parameter.

| Variable Name              | Default                                          | Explanation                                                               |
|----------------------------|--------------------------------------------------|---------------------------------------------------------------------------|
| `mongodb.port`             | 27017                                            | The port to connect to the MongoDB instance                               |
| `mongodb.database`         | tmf                                              | The database name to connect to the MongoDB instance                      |
| `api.image`                | akumartmf/usagemanagementapi:0.2                 | The image for the TMF635 Usage Management API microservice                |
| `api.port`                 | 8080                                             | The port on which the TMF635 API microservice listens                     |
| `usageconsumption.image`   | akumartmf/usageconsumptionapi:0.7                | The image for the TMF677 Usage Consumption API microservice               |
| `metrics.image`            | akumartmf/productusagemanagementmetrics:0.1      | The image for the open metrics microservice                               |

# ODA Canvas

To know more about the ODA Canvas visit: https://github.com/tmforum-oda/oda-canvas
