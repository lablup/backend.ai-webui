---
title: Backend.AI License (Software)
order: 194
---
# Backend.AI License (Software)

This document defines the terms of the license agreement for the Backend.AI software. The usage fee and support plan of Backend.AI Cloud service provided by Lablup is independent of this policy.

Backend.AI server components (hereinafter referred to as "Backend.AI Server") are distributed under the GNU Lesser General Public License v3.0 ("LGPL"), and API Client libraries and auxiliary components for accessing Backend.AI server (hereinafter "Backend.AI Client") are distributed under the MIT License. Even if LGPL complies, commercial contracts with Lablup Co., Ltd. ("Lablup") are required depending on the conditions when performing profit activities using the Backend.AI server. Several additional plug-ins and admin's GUI Control-Panel that apply to Backend.AI enterprise solutions are not open source, but commercial software.

## **Term Definition**

* Hardware: Includes physical computers, virtual machine and container environments that users own or lease and have rights to run software.
* Organization: Individuals, corporations, organizations, institutions (including non-profit and commerical organizations; however, subsidiaries that are separate corporations are not included)

LGPL must be followed when users use and change Backend.AI Server (Manager / Agent / Common) or develop and distribute software that uses it. However, in the case of distributing software which import Backend.AI server as a module without changing it (e.g. Python import), it is regarded as a dynamic link and code disclosure under the LGPL is exempted. When Backend.AI server is installed on the hardware and used by the general public through the network, there is no obligation under the LGPL.

The correct interpretation of all other cases is subject to the LGPL original text and court judgment.

Apart from LGPL compliance, commercial contracts must be made with Lablup in the following cases:

1. When software that works only after installing the Backend.AI server is sold to customers outside the organization.
2. When hardware including Backend.AI server is sold to customers outside the organization.
3. When the Backend.AI server is installed on the hardware and the usage fee is received from a customer outside the organization that uses it.

In other cases, you can use the Backend.AI server for free.

## **Interpretation Example**

* If you distribute Backend.AI server with modifications to outside the organization, you must disclose the code and apply LGPL the same way. There is no obligation to disclose the code if it is olny used internally.
* When distributing software that uses Backend.AI server as an essential library,
  * Free distribution: The software does not have to be (L)GPL, and a separate contract with Lablup is not required.
  * Paid distribution: The software does not need to be (L)GPL, but a commercial contract with Lablup is required.
* When Backend.AI server is installed on the hardware and it is used by the public through network,
  * Free distribution: No separate contract with Lablup is required.
  * Paid distribution: A commercial contract with Lablup is required.
* When distributing hardware in which Backend.AI server is installed,
  * Free distribution: No separate contract with Lablup is required.
  * Paid distribution: A commercial contract with Lablup is required.

Commercial contracts include monthly / annual subscription fees for the enterprise version by default, but details may vary depending on individual contracts.
