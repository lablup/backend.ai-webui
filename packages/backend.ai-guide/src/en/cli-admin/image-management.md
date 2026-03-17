---
title: Image Management
order: 111
---
# Image Management

Backend.AI uses container images to provide pre-configured environments for compute sessions. As an administrator, you can manage which images are available, rescan container registries for new images, and configure resource requirements for each image.

## Listing Registered Images

To view all container images currently registered in your Backend.AI cluster:

```shell
$ backend.ai admin image list
```

This displays image names, tags, registry information, and supported architectures. You can filter the output by adding options:

```shell
$ backend.ai admin image list --filter "name~cr.backend.ai"
```

## Rescanning Container Registries

When new images are pushed to a container registry, you must rescan the registry to make them available in Backend.AI:

```shell
$ backend.ai admin image rescan REGISTRY_NAME
```

For example, to rescan the default Backend.AI registry:

```shell
$ backend.ai admin image rescan cr.backend.ai
```

:::note
Rescanning may take several minutes depending on the number of images in the registry. The operation runs asynchronously on the manager.
:::

## Image Aliases and Tags

Backend.AI supports image aliases, which provide convenient shorthand names for frequently used images. For example, instead of specifying the full image path, you can use an alias like `python` or `pytorch`.

To view the current aliases:

```shell
$ backend.ai admin image alias list
```

## Managing Image Permissions

Administrators can control which images are available to specific domains. This allows you to restrict access to certain images based on organizational requirements.

To set allowed images for a domain:

```shell
$ backend.ai admin domain update DOMAIN_NAME --allowed-docker-registries REGISTRY_NAME
```

:::warning
Changing allowed registries for a domain affects all users within that domain. Ensure that required images remain accessible before modifying these settings.
:::

## Resource Requirements for Images

Each image can have minimum resource requirements defined, such as minimum CPU cores, memory, or GPU allocation. These requirements ensure that sessions created with the image have sufficient resources to operate correctly.

Resource requirements are typically configured at the image metadata level within the container registry and are imported during the rescan process. Consult your Backend.AI cluster documentation for details on setting custom resource requirements for specific images.
