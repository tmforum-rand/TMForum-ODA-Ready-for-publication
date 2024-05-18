# TMF641 ServiceOrdering R18 5
Installing and Running Conformance Test Kit
The CTK is dependent on the installation of node.js and npm to work.
Node.js and NPM can be downloaded and installed from:

>https://nodejs.org/

Once Node.js and npm are installed download and unzip the CTK-TMF641-ServiceOrdering-R18-5 ZIP file within your test directory.

You should see the following files between many others :

>Windows-BAT-RUNCTK.bat

>Windows-PowerSheel-RUNCTK.ps1

>Linux-RUNCTK.sh

## 1.
### For Windows
For Windows you need to right click Windows-Powershell-RUNCTK.ps1 and select run with PowerShell, press Y and Enter, wait for the dependencies to be installed go to Step 2.
If you don't have access to Powershell you can double click the Windows-BAT-RUNCTK.bat and go to Step 2.
### For Linux and Mac
For Linux and Mac you need to give executable permission for the Linux-RUNCTK.sh file, you can do that by opening a terminal and typing:
>chmod +x ./Linux-RUNCTK.sh

and 

>./Linux-RUNCTK.sh

Wait for NPM to install the dependencies and go to step 2.

## 2.
Finally enter the URL for the base of your API, for example if you can get a resource on:
>https://tm-forum-open-api-reference-implementation.mybluemix.net/tmf-api/serviceOrdering/v4/serviceOrder

You should input:
>https://tm-forum-open-api-reference-implementation.mybluemix.net/tmf-api/serviceOrdering/v4/

The script will now run for a few minutes and when it ends, you will have a resultsHTML.html file inside the folder, this is the file you need to forward to TMForum to get your certification if your API passed every test, the file should look like this:

![CTK Example Image](https://github.com/tmforum-rand/CTK-TMF641-ServiceOrdering-R18-5/blob/master/images/Output-Example.png)







If there are no failures then you have passed the CTK and your API is conformant with all
the Mandatory features.





