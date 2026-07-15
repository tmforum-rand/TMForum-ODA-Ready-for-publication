#     TMFC001 Product Catalog Management

#  ODA Component Conformance Profile TMFC001 Version -- v 1.0.0 

  -----------------------------------------------------------------------
  Maturity Level: Alpha, Beta, General Team Approved Date: DD-MMM-YYYY
  Availability (GA)                    
  ------------------------------------ ----------------------------------
  **Release Status: Pre-production**   **Approval Status: Team Approved**

  **Version 1.0.0**                    **IPR Mode: RAND**
  -----------------------------------------------------------------------

**\**

Notice

Copyright © TM Forum 2025. All Rights Reserved.

This document and translations of it may be copied and furnished to
others, and derivative works that comment on or otherwise explain it or
assist in its implementation may be prepared, copied, published, and
distributed, in whole or in part, without restriction of any kind,
provided that the above copyright notice and this section are included
on all such copies and derivative works. However, this document itself
may not be modified in any way, including by removing the copyright
notice or references to TM FORUM, except as needed for the purpose of
developing any document or deliverable produced by a TM FORUM
Collaboration Project Team (in which case the rules applicable to
copyrights, as set forth in the [TM FORUM IPR
Policy](http://www.tmforum.org/IPRPolicy/11525/home.html), must be
followed) or as required to translate it into languages other than
English.

The limited permissions granted above are perpetual and will not be
revoked by TM FORUM or its successors or assigns.

This document and the information contained herein is provided on an "AS
IS" basis and TM FORUM DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO ANY WARRANTY THAT THE USE OF THE
INFORMATION HEREIN WILL NOT INFRINGE ANY OWNERSHIP RIGHTS OR ANY IMPLIED
WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.

Direct inquiries to the TM Forum office:

181 New Road, Suite 304

Parsippany, NJ 07054, USA

Tel No. +1 862 227 1648

TM Forum Web Page: [www.tmforum.org](http://www.tmforum.org)

# Table of Contents {#table-of-contents .TOC-Heading}

[TMFC001 Product Catalog Management
[1](#tmfc001-product-catalog-management)](#tmfc001-product-catalog-management)

[ODA Component Conformance Profile TMFC001 Version -- v 1.0.0
[1](#oda-component-conformance-profile-tmfc001-version-v-1.0.0)](#oda-component-conformance-profile-tmfc001-version-v-1.0.0)

[1. Introduction [5](#introduction)](#introduction)

[2. Core Functionality [6](#core-functionality)](#core-functionality)

[2.1 Compliance Requirements to Exposed API(s)
[6](#compliance-requirements-to-exposed-apis)](#compliance-requirements-to-exposed-apis)

[2.1.1 TMF620 version 4.0 API Conformance
[6](#tmf620-version-4.0-api-conformance)](#tmf620-version-4.0-api-conformance)

[2.1.2 ODA Specific TMF620 API Conformance v4.0
[6](#oda-specific-tmf620-api-conformance-v4.0)](#oda-specific-tmf620-api-conformance-v4.0)

[2.2 Dependent API Conformance
[6](#dependent-api-conformance)](#dependent-api-conformance)

[3. Canvas Conformance [7](#canvas-conformance)](#canvas-conformance)

[3.1 Deployment Conformance
[7](#deployment-conformance)](#deployment-conformance)

[3.2 Configuration Conformance
[8](#configuration-conformance)](#configuration-conformance)

[4. Security Conformance
[10](#security-conformance)](#security-conformance)

[4.1.1 Security Function Static Role Conformance
[10](#security-function-static-role-conformance)](#security-function-static-role-conformance)

[4.1.1.1 If the security function implements a static role then it must
specify a canvasSystemRole
[10](#if-the-security-function-implements-a-static-role-then-it-must-specify-a-canvassystemrole)](#if-the-security-function-implements-a-static-role-then-it-must-specify-a-canvassystemrole)

[4.1.2 Security Function Dynamic Role Conformance
[10](#security-function-dynamic-role-conformance)](#security-function-dynamic-role-conformance)

[4.1.2.1 If the security function implements a dynamic role then it must
pass Security Exposed API Conformance
[10](#if-the-security-function-implements-a-dynamic-role-then-it-must-pass-security-exposed-api-conformance)](#if-the-security-function-implements-a-dynamic-role-then-it-must-pass-security-exposed-api-conformance)

[4.1.2.3 Security Dependent API Conformance
[10](#security-dependent-api-conformance)](#security-dependent-api-conformance)

[None [10](#none)](#none)

[5. Management Conformance
[11](#management-conformance)](#management-conformance)

[6. Sample CTK Config file -- CHANGE_ME.json
[12](#sample-ctk-config-file-change_me.json)](#sample-ctk-config-file-change_me.json)

[6.1 CHANGE_ME.json - Parameter Reference Table
[12](#change_me.json---parameter-reference-table)](#change_me.json---parameter-reference-table)

[6.2 CHANGE_ME.json -- Example reference for component under test
[13](#change_me.json-example-reference-for-component-under-test)](#change_me.json-example-reference-for-component-under-test)

# Introduction

The conformance requirements outlined in this profile apply to the
specified CTK version 1.0.0 of the TMFC001 ODA Component. Any deviations
from these requirements may result in non-conformance.

# Core Functionality

## Compliance Requirements to Exposed API(s)

The below table lists the mandatory Exposed API for TMFC001

  ----------------------------------------------------------------------------
  API               Version    Reference to CTK
  ----------------- ---------- -----------------------------------------------
  TMF620            4.0        <https://www.tmforum.org/oda/open-apis/table>

  ----------------------------------------------------------------------------

### TMF620 version 4.0 API Conformance 

The component's API must support all mandatory resources, operations,
attributes, and notifications as mentioned in [TMF620B (TMF620v4.0
Conformance Profile)](https://www.tmforum.org/oda/open-apis/table)

The below sections specify the additional mandatory resources,
operations, attributes and notifications to be supported for ODA
specific in addition to TMF620 specific API Conformance.

### ODA Specific TMF620 API Conformance v4.0

None

## Dependent API Conformance

None

# Canvas Conformance

## Deployment Conformance

Canvas should be Kubernetes based and it is required to have the
component deployment in a Kubernetes based environment. Cluster should
be running on a supported Kubernetes version. Ensure that the Kubernetes
manifests, deployment configurations, and custom resources are
compatible with the targeted Kubernetes API version. Compatibility with
3 previous Kubernetes versions must also be considered for backward
compatibility.

only trusted container images from reputable sources must be used.

The component deployment and the Kubernetes cluster must pass the
following tests:

1.  Step 0: Basic environment connectivity tests

    a.  Kubectl configured correctly

        i.  The purpose of this test is to check if the kubectl is
            configured correctly.

        ii. The configuration must be available and the context must be
            set to the correct cluster

        iii. Kubectl should return pods in \<namespace of components\>
             namespace

2.  Step1: Deployment component tests

    a.  Component can be found in namespace: \<namespace of components\>

        i.  The component must be found in the established namespace for
            components

    b.  Component has deployed successfully (status: Complete)

        i.  The component must have deployed successfully and its status
            must be complete

    c.  Test if all exposed api are accessible and return status is 200

        i.  All exposed apis defined in the component must provide a
            valid url

    d.  Security api must return at least one partyrole with canvas
        system role defined in component file

        i.  The security api must return at least one partyrole, unless
            only canvasSystemRole is defined

    e.  CTKs for all exposed apis have been executed successfully

        i.  This step configures the api ctks. There must be no errors
            during the process

## Configuration Conformance

Helm chart MUST be used to deploy the ODA Component in a Kubernetes
cluster and should contain all necessary resources. Configuration file
MUST in YAML.

Namespace MUST exist for Canvas and Components.

Custom resource Definition (CRD) MUST exist for Components and API
definitions.

Canvas operator and Canvas component versioning webhook MUST be running.

The deployed component must pass the following configuration checks:

1.  Step 0: Component file checks

    a.  Component's helm manifest file must exist at the path specified
        in ctkconfig.json -- as retrieved from Kubernetes

    b.  File contains valid YAML

        i.  Component manifest must be valid YAML

2.  Step 1: Component manifest checks

    a.  Document of kind 'Component' is found

        i.  Component manifest must contain a document of kind:
            Component

    b.  Component api version is within supported versions

        i.  Component manifest must contain a supported api version
            (oda.tmforum.org/v1)

    c.  Component has metadata field

        i.  Component manifest must contain a metadata field

    d.  Component metadata has name and labels

        i.  Component metadata must contain name and label fields

    e.  Component has spec field

        i.  Component manifest must contain a spec field

    f.  Spec has coreFunction with exposed and dependent APIs

        i.  Component spec must contain a coreFunction field with
            exposedAPIs and dependentAPIs

    g.  Spec has security function

        i.  Component spec must contain a security field

    h.  Security function has canvas system role or exposed apis

        i.  Security function must contain a canvas system role (string)
            or expose a partyRole API

    i.  All resources are labelled with the component name

        i.  All resources in the component manifest must be labelled
            with the component name

    j.  Standard component specification exists in the component ctk

        i.  TM Forum standard component specification must exist in the
            resources folder of the component CTK (gets downloaded by
            the CTK if doest exist)

    k.  Component ID from the manifest of component under test matches
        the standard specification

        i.  Component manifest ID must match the ID in the standard
            component specification

    l.  Exposed Apis defined in standard component specification must be
        specified in component manifest

        i.  All mandatory Exposed APIs defined in the standard component
            specification must be specified in the component manifest

    m.  Dependent APIs defined in the standard component specification
        must be specified in the component manifest

        i.  All mandatory Dependent APIs in the standard component
            specification must also be declared in the component
            manifest

    n.  All swagger urls must be valid and accessible and version fields

        i.  All swagger urls must be valid and accessible

## Security Conformance

The below table lists the Mandatory Exposed and Dependent API required
for Security Conformance of TMFC001

### Security Function Static Role Conformance

### If the security function implements a static role then it must specify a canvasSystemRole

### Security Function Dynamic Role Conformance

### If the security function implements a dynamic role then it must pass Security Exposed API Conformance

If TMF669 is implemented:

  ----------------------------------------------------------------------------
  API               Version    Reference to CTK
  ----------------- ---------- -----------------------------------------------
  TMF669            4.x        <https://www.tmforum.org/oda/open-apis/table>

  ----------------------------------------------------------------------------

#### TMF669 API Conformance **v4.x**

The component's API must support all mandatory resources, operations,
attributes, and notifications as mentioned in [TMF669B (TMF669v4.x
Conformance Profile)](https://www.tmforum.org/oda/open-apis/table)

#### ODA Specific TMF669 API Conformance v4.x

> None

### Security Dependent API Conformance

### None

## Management Conformance

Below table lists the Mandatory Exposed and Dependent API required for
Management Conformance of TMFC001

5.1.1 Management Exposed API Conformance

None

5.1.2 Management Dependent API Conformance

None

# Sample CTK Config file -- CHANGE_ME.json

### CHANGE_ME.json - Parameter Reference Table

  -------------------------------------------------------------------------------------
  **Parameter**                  **Description**             **Editable   **Required**
                                                             by User**   
  ------------------------------ -------------------------- ------------ --------------
  releaseName                    Helm release name of the       Yes           Yes
                                 deployed component under                
                                 test in the Canvas                      

  component_to_run               Component ID of the            Yes           Yes
                                 component under test                    

  component_namespace            Canvas namespace of the        Yes           Yes
                                 deployed component                      

  standardComponentPath          Override directory             Yes         Optional
                                 location for the TM Forum               
                                 standard component                      
                                 specification YAML                      

  ctk_name_mapping               Override mapping for TMF       Yes         Optional
                                 API IDs to their                        
                                 corresponding CTK folder                
                                 names if they differ from               
                                 default                                 

  runExposedOptional             Flag for running API CTKs      Yes         Optional
                                 for optional exposed apis               

  runDependentOptional           Flag for running API CTKs      Yes         Optional
                                 for optional dependent                  
                                 apis                                    

  runSecurityOptional            Flag for running API CTKs      Yes         Optional
                                 for optional security apis              

  ctk_download_urls              JSON file reference url         No           Yes
                                 with mapping for download               
                                 paths of required API CTKs              

  standardComponentDownload{}    Download parameters for         No           Yes
                                 standard component                      
                                 specification                           

  ctkconfig.companyName          Name of the company            Yes           Yes
                                 running the conformance                 
                                 certification                           

  ctkconfig.productName          Name of the product            Yes           Yes
                                 implementation being                    
                                 tested                                  

  ctkconfig.productUrl           Public URL for product         Yes           Yes
                                 information or support                  

  ctkconfig.componentUrl         Public URL of the TM Forum      No           Yes
                                 Component Directory                     

  ctkconfig.headers              Global headers (e.g.,          Yes         Optional
                                 Authorization tokens) to                
                                 be included in API tests                
                                 requests                                

  ctkconfig.payloads             Override payloads for each     Yes         Optional
                                 API CTK being executed                  

  ctkconfig.rejectUnauthorized   If true, CTK will enforce      Yes           Yes
                                 TLS certificate validation              
                                 for HTTPS requests. If                  
                                 false, self-signed or                   
                                 unverified certificates                 
                                 will be accepted (e.g.,                 
                                 for local testing).                     

  dependentStubs{}               A mapping of dependent TMF     Yes         Yes (For
                                 APIs to stub release names                components
                                 and optional headers for                with mandatory
                                 the component under test.                 dependent
                                 Used to identify                            APIs)
                                 pre-installed stub                      
                                 components for dependent                
                                 APIs and configure                      
                                 authentication if                       
                                 required.                               

  bddPayloads{}                  Dictionary containing base     Yes         Yes (For
                                 and target payloads for                   components
                                 each BDD test scenario for              with mandatory
                                 components under test with                dependent
                                 mandatory dependent APIs                    APIs)

  retrySettings{}                Configurable retry              No         Optional
                                 settings in use by the                  
                                 component CTK when                      
                                 managing deployments                    
  -------------------------------------------------------------------------------------

###  CHANGE_ME.json -- Example reference for component under test

{

\"releaseName\": \"pc-1\",

\"component_to_run\": \"TMFC001\",

\"component_namespace\": \"components\",

\"standardComponentPath\": \"\",

\"ctk_name_mapping\": {},

\"runExposedOptional\": false,

\"runDependentOptional\": false,

\"runSecurityOptional\": false,

\"ctk_download_urls\":
\"https://raw.githubusercontent.com/tmforum-rand/TMForum-ODA-Component-Specification/refs/heads/v1beta4/apiIndex.json\",

\"standardComponentDownload\": {

\"apiBaseUrl\": \"https://api.github.com\",

\"repoOwner\": \"tmforum-rand\",

\"repoName\": \"TMForum-ODA-Ready-for-publication\",

\"gitUrl\":
\"https://raw.githubusercontent.com/tmforum-rand/TMForum-ODA-Ready-for-publication/refs/heads\",

\"gitBranch\": \"v1beta4\",

\"sslVerify\": false

},

\"ctkconfig\": {

\"companyName\": \"TM FORUM\",

\"productName\": \"REFERENCE EXAMPLE PRODUCT CATALOG\",

\"productUrl\": \"www.tmforum.org\",

\"componentUrl\":
\"https://www.tmforum.org/oda/directory/components-map\",

\"headers\": {

\"Accept\": \"application/json\",

\"Content-Type\": \"application/json\"

},

\"payloads\": {

\"TMF669_v4\": {

\"PartyRole\": {

\"POST\": {

\"payload\": {

\"name\": \"qqymucymyd\"

}

}

}

}

},

\"rejectUnauthorized\": false

},

\"dependentStubs\": {},

\"bddPayloads\": {},

\"retrySettings\": {

\"maxRetries\": 30,

\"retryInterval\": 10000

}

}
