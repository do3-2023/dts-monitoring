# dts-kube

To log in to package registry:

```
echo MY_PERSONAL_ACCESS_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

To create docker images go to a corresponding folder and run one of the following commands:

```
docker build -t ghcr.io/do3-2023/dts-kube-api:v1.0 .
docker build -t ghcr.io/do3-2023/dts-kube-front:v1.0 .
```