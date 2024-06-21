# Deploying an application in Kubernetes (RKE2 & Cilium)

**Dziyana Tsetserava - DO4**

## Project structure

### Frontend

**Url:** http://162.38.112.79 (V1), http://162.38.112.79:32000 (V3)

**Note:** The frontend code can be found in the *frontend* folder.

The project's frontend is made with Angular Universal which allows Angular to render applications on server. It has two routes:

- "`/`": displays a list of people requested from the API, as well as a form to add a new person to the database.

- "`/healthz`": the health route serves to verify the liveliness and readiness of the application, it sends a request to the API's corresponding `/healthz` route and returns Internal Server Error if something goes wrong.

### API

**Url:** http://162.38.112.79/api (V1), http://162.38.112.79/api-test (V3)

**Note:** The backend code can be found in the *api* folder.

The project's backend is made with NestJS framework. It offers the same endpoints as the frontend:

- "`GET /`": the root route queries a database for a list of people stored in the table `Person` and sends it to the frontend.

- "`POST /`": adds a new person to the database (a JSON object with the person's data should be sent in the request body).

- "`/healthz`": the health route sends a request to the database and returns Internal Server Error if something goes wrong.

### WebAssembly API

**Url:** http://162.38.112.92/api-wasm (API itself), http://162.38.112.92 (to test API via frontend)

**Note:** The code for the new Wasm API can be found in the *api-wasm* folder.

It appeared to be impossible to convert my existing NestJS API to Wasm, so I ended up building a new TypeScript API from scratch using the `http-ts` template provided by Spin CLI.

It has the same endpoints as my previous API and can be built and launched with the commands `spin build` and `spin up`.

**My feedback on Wasm:**

The idea of a portable, light-weight and high-performance format for multiple programming languages sounds great in theory, but looks very raw and unfinished in practice. So far, only a handful of libraries have been tested and proven to work well with the Spin SDK for JavaScript apps. NestJS packages are clearly not in the list, for example. Even connecting to the database should be done with the classes provided in `@fermyon/spin-sdk`, I was unable to use TypeORM as I did in my previous API. 

And it looks like an SDK made for one WASM runtime is not transportable to another. To move an app from Wasmtime to WasmEdge, a developer would need to modify the code to use a new SDK.

Deploying the app in Kubernetes, using Spin executor proved to be relatively easy though, since the process is quite well documented.

All in all, while I'm looking forward to the moment when Wasm becomes more mature and convenient to use, I wouldn't choose to use it for my projects right now. At least not for TypeScript projects.

### Database

**Note:** The database init script and a *docker-compose.yaml* file for quick local testing can be found in the *database* folder.

I am using a PostgreSQL database for this project. It has just one table `Person` with only three attributes: `last_name`, `phone_number` and `location`.

## Kubernetes commands to deploy the project

**Note:** Move to the *kube* folder and execute commands from there.

1. Create an RKE2 cluster with the following configuration in the */etc/rancher/rke2/config.yaml* file on the server node:
```
write-kubeconfig-mode: "0644"
cni: none
disable-kube-proxy: true
tls-san:
  - <You master node's IP>
debug: true
disable:
  - rke2-ingress-nginx

```

2. Install Cilium with the config values that can be found in *kube/cilium-conf.yaml* (can be installed with Helm).

3. Create an IP pool for Cilium Load Balancer to be able to provide IPs to LoadBalancer services:

```
kubectl apply -f ippool.yaml
```

4. Create a gateway/gateways for your IP addresses listening on port 80

```
kubectl apply -f gateways.yaml
```

5. Create three namespaces for the frontend, api and database pods respectively:

```
kubectl apply -f namespaces.yaml
```

6. Login to docker registry:

```
echo PERSONAL_ACCESS_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

7. Create secrets in `front` and `back` namespaces to allow Kubernetes access private Docker repository to pull container images:

```
kubectl create secret generic regcred --from-file=.dockerconfigjson=/home/username/.docker/config.json --type=kubernetes.io/dockerconfigjson --namespace=back

kubectl create secret generic regcred --from-file=.dockerconfigjson=/home/username/.docker/config.json --type=kubernetes.io/dockerconfigjson --namespace=front
```

The file *.docker/config.json* was created automatically in your home folder after `docker login`. The newly created secrets' names should be provided to deployments via `imagePullSecrets` property (see *deployment.yaml* for an example).

8. Launch a database:

```
kubectl apply -f ./db
```

9. Launch an API

Provide the deployments manifest with the values for the following 2 variables: TARGET_ROLE ('blue' for the older stable version, 'green' for the new one to test) and MONITORING_VERSION (container image tag to use, e.g. 'v1.4').

See an example of a command to create the deployment for the 'blue' version of the app:

```
TARGET_ROLE=blue MONITORING_VERSION=v1.4 envsubst '${TARGET_ROLE} ${MONITORING_VERSION}' < <(cat ./api/*.yaml) | kubectl apply -f -
```

As you can see, the *configmaps.yaml* file contains the script to create a table and insert rows from the *database/init.sql* file. This is the command to use to transform a file into a config map:
```
kubectl create configmap db-config --from-file=./database/init.sql -n back --dry-run=client -o yaml > ./database/db-configmap.yaml
```

10. Launch the Frontend

Provide the deployments manifest with the values for the following 3 variables: TARGET_ROLE, MONITORING_VERSION and MONITORING_API_URL (publicly accessible URL of the API service).

See an example of a command to create the deployment for the 'blue' version of the app:

```
TARGET_ROLE=blue MONITORING_VERSION=v1.4 MONITORING_API_URL=http://162.38.112.79/api  envsubst '${TARGET_ROLE} ${MONITORING_VERSION} ${MONITORING_API_URL}' < <(cat ./web/*.yaml) | kubectl apply -f -
```

11. Launch test deployments for "green" versions of API and frontend:

```
TARGET_ROLE=green MONITORING_VERSION=v3.0 envsubst '${TARGET_ROLE} ${MONITORING_VERSION}' < ./api/deployment.yaml | kubectl apply -f -

TARGET_ROLE=green MONITORING_VERSION=v3.0 MONITORING_API_URL=http://162.38.112.79/api-test  envsubst '${TARGET_ROLE} ${MONITORING_VERSION} ${MONITORING_API_URL}' < ./web/deployment.yaml | kubectl apply -f -
```

The services and other resources for the test deployments were created by the steps 9 and 10, so you can directly test your new app version at [http://162.38.112.79:32000/](http://162.38.112.79:32000/).

12. To update the app version with a Blue/Green deployment strategy

To replace 'blue' production versions with 'green' while having zero downtime, update main services with 'green' TARGET_ROLE. Do not delete the test API service though, since its link was already given to the frontend container in the variable MONITORING_API_URL:

```
TARGET_ROLE=green envsubst < ./web/services.yaml | kubectl apply -f -

TARGET_ROLE=green envsubst < ./api/services.yaml | kubectl apply -f -
```

Redeploy the 'blue' version to correspond to your newest stable version:

```
TARGET_ROLE=blue MONITORING_VERSION=v3.0 envsubst '${TARGET_ROLE} ${MONITORING_VERSION}' < ./api/deployment.yaml | kubectl apply -f -

TARGET_ROLE=blue MONITORING_VERSION=v3.0 MONITORING_API_URL=http://162.38.112.79/api  envsubst '${TARGET_ROLE} ${MONITORING_VERSION} ${MONITORING_API_URL}' < ./web/deployment.yaml | kubectl apply -f -
```

Move services back to the renewed 'blue' version:

```
TARGET_ROLE=blue envsubst < ./web/services.yaml | kubectl apply -f -

TARGET_ROLE=blue envsubst < ./api/services.yaml | kubectl apply -f -
```

13. Launch a Wasm API:

```
kubectl apply -f ./wasm
```

14. Launch a new frontend to test the Wasm API:

```
TARGET_ROLE=wasm MONITORING_VERSION=v3.0 MONITORING_API_URL=http://162.38.112.92/api-wasm  envsubst '${TARGET_ROLE} ${MONITORING_VERSION} ${MONITORING_API_URL}' < ./web/deployment.yaml | kubectl apply -f -
```