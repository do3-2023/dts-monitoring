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

6. Create persistence volume and persistence volume claim:

```
sudo kubectl apply -f persistencevolume.yaml

sudo kubectl apply -f persistencevolumeclaim.yaml
```

7. Create deployments:

```
sudo kubectl apply -f deployments.yaml
```

8. Create services:

```
sudo kubectl apply -f services.yaml
```

9. Check if the project is running:

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