Create a cluster with one server node:
```
sudo k3d cluster create dts-kube-cluster

```
Create three namespaces for the frontend, api and database pods respectively:

sudo kubectl create ns front
sudo kubectl create ns back
sudo kubectl create ns data

echo PERSONAL_ACCESS_TOKEN | sudo docker login ghcr.io -u USERNAME --password-stdin

Create a secret called regcred (or any other name of your choice) to allow Kubernetes access private Docker repository to pull container images:

sudo kubectl create secret generic regcred --from-file=.dockerconfigjson=/home/username/.docker/config.json --type=kubernetes.io/dockerconfigjson --namespace=back

sudo kubectl create secret generic regcred --from-file=.dockerconfigjson=/home/username/.docker/config.json --type=kubernetes.io/dockerconfigjson --namespace=front

The file *.docker/config.json* was created automatically in your home folder after `docker login`. The newly created secrets' names should be provided to deployments via `imagePullSecrets` property (see *deployment.yaml* for an example).

Create secrets for database environment variables:

sudo kubectl create secret generic db -n back --from-literal=POSTGRES_DB=dts-kube --from-literal=POSTGRES_PASSWORD=dts-kube --from-literal=POSTGRES_USER=dts-kube

sudo kubectl create secret generic db -n data --from-literal=POSTGRES_DB=dts-kube --from-literal=POSTGRES_PASSWORD=dts-kube --from-literal=POSTGRES_USER=dts-kube

Create persistence volume and persistence volume claim:

sudo kubectl apply -f persistencevolume.yaml

sudo kubectl apply -f persistencevolumeclaim.yaml

Create deployments:

sudo kubectl apply -f deployments.yaml