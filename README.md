# Deploying an application in Kubernetes

**Dziyana Tsetserava - DO3**

## Project structure

### Frontend

**Note:** The frontend code can be found in the *hello-world* folder.

The project's frontend is made with Angular Universal which allows Angular to render applications on server. It has two routes:

- "`/`": the root route displays a message received from the API, which is initially stored in the database.

- "`/healthz`": the health route serves to verify the liveliness of the application, it sends a request to the API's corresponding `/healthz` route and returns Internal Server Error if something goes wrong.

### API

**Note:** The backend code can be found in the *api* folder.

The project's backend is made with NestJS framework. It offers the same routes as the frontend, both for HTTP GET requests:

- "`/`": the root route inserts a "Hello World" message in the database and then queries a database for a message (the same "Hello World") to send to the frontend. It also adds the total number of extracted table rows to its reply. It's completely useless, but allows to check that database connection works.

- "`/healthz`": the health route sends a request to the database and returns Internal Server Error if something goes wrong.

### Database

I am using a PostgreSQL database for this project. It has just one table `hello` with only two attributes: `id` and `message`.

## Kubernetes commands to deploy the project

**Note:** Move to the *kube* folder and execute commands from there.

1. Create a cluster with one server node:
```
sudo k3d cluster create dts-kube-cluster
```

2. Create three namespaces for the frontend, api and database pods respectively:

- Command line:
```
sudo kubectl create ns front
sudo kubectl create ns back
sudo kubectl create ns data
```
- YAML file
```
sudo kubectl apply -f namespaces.yaml
```

3. Login to docker registry:

```
echo PERSONAL_ACCESS_TOKEN | sudo docker login ghcr.io -u USERNAME --password-stdin
```

4. Create secrets in `front` and `back` namespaces to allow Kubernetes access private Docker repository to pull container images:

```
sudo kubectl create secret generic regcred --from-file=.dockerconfigjson=/home/username/.docker/config.json --type=kubernetes.io/dockerconfigjson --namespace=back

sudo kubectl create secret generic regcred --from-file=.dockerconfigjson=/home/username/.docker/config.json --type=kubernetes.io/dockerconfigjson --namespace=front
```

The file *.docker/config.json* was created automatically in your home folder after `docker login`. The newly created secrets' names should be provided to deployments via `imagePullSecrets` property (see *deployment.yaml* for an example).

The above secrets can be created with a YAML file, but I prefer not to disclose sensitive access data.

5. Create secrets for database environment variables in two namespaces:

- Command line:
```
sudo kubectl create secret generic db -n back --from-literal=POSTGRES_DB=dts-kube --from-literal=POSTGRES_PASSWORD=dts-kube --from-literal=POSTGRES_USER=dts-kube

sudo kubectl create secret generic db -n data --from-literal=POSTGRES_DB=dts-kube --from-literal=POSTGRES_PASSWORD=dts-kube --from-literal=POSTGRES_USER=dts-kube
```
- YAML file:
```
sudo kubectl apply -f secrets.yaml
```

6. Create config maps for database init script and environment variables:

```
kubectl apply -f configmaps.yaml
```

As you can see, the *configmaps.yaml* file contains the script to create a table and insert rows from the *database/init.sql* file. This is the command to use to transform a file into a config map:
```
kubectl create configmap db-config --from-file=./database/init.sql -n back --dry-run=client -o yaml > ./database/db-configmap.yaml
```

7. Create persistence volume and persistence volume claim:

```
sudo kubectl apply -f persistencevolume.yaml

sudo kubectl apply -f persistencevolumeclaim.yaml
```

8. Create deployments:

Provide the deployments manifest with the values for the following 3 variables: TARGET_ROLE ('blue' for the older stable version, 'green' for the new one to test), MONITORING_VERSION (container image tag to use, e.g. 'v1.4') and MONITORING_API_URL (publicly accessible URL of the API service).

See an example of a command to create the deployments for the both 'blue' and 'green' versions of the app:

```
TARGET_ROLE=blue MONITORING_VERSION=v1.4 MONITORING_API_URL=http://162.38.112.79:3000  envsubst '${TARGET_ROLE} ${MONITORING_VERSION} ${MONITORING_API_URL}' < kube/deployments.yaml | kubectl apply -f -

TARGET_ROLE=green MONITORING_VERSION=v2.0 MONITORING_API_URL=http://162.38.112.92:32500  envsubst '${TARGET_ROLE} ${MONITORING_VERSION} ${MONITORING_API_URL}' < kube/deployments.yaml | kubectl apply -f -
```

Notice that the port values in MONITORING_API_URL need to be provided in the next step to service manifests in order to expose the API on the port expected by the frontend.

9. Create services:

Use the following command to create services for stable frontend and API versions:
```
TARGET_ROLE=blue envsubst < kube/services.yaml | kubectl apply -f -
```

Also create test services for 'green' versions:

```
kubectl apply -f kube/test-services.yaml
```

To replace 'blue' production versions with 'green' while having zero downtime, update main services with 'green' TARGET_ROLE. Do not delete the test API service though, since its link was already given to the frontend container in the variable MONITORING_API_URL:

```
TARGET_ROLE=green envsubst < kube/services.yaml | kubectl apply -f -
```

Redeploy the 'blue' version to correspond to your newest stable version:

```
TARGET_ROLE=blue MONITORING_VERSION=v2.0 MONITORING_API_URL=http://162.38.112.79:3000  envsubst '${TARGET_ROLE} ${MONITORING_VERSION} ${MONITORING_API_URL}' < kube/deployments.yaml | kubectl apply -f -
```

Move services back to the renewed 'blue' version and delete test services:

```
TARGET_ROLE=blue envsubst < kube/services.yaml | kubectl apply -f -

kubectl delete -f kube/test-services.yaml
```

10. Check if the project is running:

Verify that all your three pods eventually get a Running status (it will take a while when deploying for the first time):
```
sudo kubectl get pods -A
```

To check the details of each pod:
```
sudo kubectl describe pod <pod-name> -n <namespace>
```

Find your cluster IP:

```
sudo kubectl get nodes -o wide
```

Navigate to http://<Internal_IP>:<NodePort_Port> (In our case, node port is set to 31000)