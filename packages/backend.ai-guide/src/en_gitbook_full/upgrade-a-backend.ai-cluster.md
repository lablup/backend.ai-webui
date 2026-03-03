---
title: Upgrade a Backend.AI Cluster
order: 44
---
# Upgrade a Backend.AI Cluster

:::warning
## **Warning**

It is recommended to terminate all workloads, including compute sessions, before initiating an upgrade. Performing a rolling upgrade without doing so may result in unexpected side effects.
:::

:::info
## Note

Unless you have a thorough understanding of the interactions between components, it is recommended to maintain a consistent single version across all parts of the Backend.AI cluster.
:::

## Minor upgrades

A minor upgrade refers to updating a Backend.AI cluster within the same major version (e.g., 25.6.0 to 25.6.1). Minor upgrades typically focus on bug fixes rather than introducing new features, and changes between minor versions are generally trivial, minimizing impact on user interactions.

### Upgrade Planning Checklist

* **Review the Release Changelog:** Carefully read the release notes for each intermediate version to understand all changes and potential impacts.
* **Upgrade Sequentially:** Perform minor upgrades consecutively, version by version. Do not skip intermediate versions, even when upgrading an outdated cluster.
* **Check for Database Schema Changes:** Determine whether the upgrade includes any database schema modifications. While it is best to keep the schema stable, some upgrades may require unavoidable changes. Always back up your database before applying schema changes.
* **Terminate Critical Workloads:** Ensure all mission-critical workloads, including compute sessions, are terminated before performing a rolling upgrade, as running workloads may be disrupted.

### Upgrading Backend.AI Manager

1. Stop the manager process running at server.
2. Upgrade the Python package by executing `pip install -U backend.ai-manager==<target version>`.
3. Match databse schema with latest by executing `alembic upgrade head`.
4. Restart the process.

### Upgrading other Backend.AI components

1. Stop the ongoing server process.
2. Upgrade the Python package by executing `pip install -U backend.ai-<component name>==<target version>`.
3. Restart the process.

### Additional Considerations

In certain situations, additional manual procedures may be required by the system administrator. Always review the release changelog to determine if any such actions are necessary.

***

## Major Upgrades

A major upgrade involves significant feature additions and structural changes. **Do not perform rolling upgrades under any circumstances.** Before initiating the upgrade, ensure that all workloads across the cluster are fully terminated and notify users in advance of the expected downtime, as the process may require a prolonged service interruption.

### Upgrade Planning Checklist

* **Upgrade to the Latest Minor Version:** Before starting a major version upgrade, upgrade the Backend.AI cluster to the latest minor version of the previous major release. _It is not permitted to upgrade directly to a new major version from an outdated minor version._
* **Do Not Skip Intermediate Major Versions:** Major upgrades must be performed sequentially. Skipping intermediate major versions or stop-gap versions is not allowed.
* **Review Allowed Upgrade Paths:** Always follow the officially supported upgrade paths as documented in the release notes. For example:
  * _Allowed:_ `23.09.10 (latest in the previous major)` → `24.03.0`
  * _Not allowed:_ `23.09.9 (non-latest minor)` → `24.03.0`
  * _Not allowed:_ `23.03.0 (not a direct prior release)` → `24.03.0`

### Upgrading Backend.AI Manager

1. Stop the manager and all related service processes on each server.
2. Upgrade the Python package by executing `pip install -U backend.ai-manager==<target version>`.
3. Match databse schema with latest by executing `alembic upgrade head`.
4. Fill out any missing DB revisions by executing `backend.ai mgr schema apply-mission-revisions <version number of previous Backend.AIsoftware>`.
5. Start the process again.

### Upgrading other Backend.AI components

1. Stop the ongoing server process.
2. Upgrade the Python package by executing `pip install -U backend.ai-<component name>==<target version>`.
3. Restart the process.

### Additional Considerations

Depending on the upgrade, additional manual procedures may be required. Always consult the release changelog for any extra instructions.
