# Mermaid Azure Function (docker)
This is a port of the [Mermaid CLI](https://github.com/mermaidjs/mermaid.cli) tool into an Azure Functions v2 (from here on out v2 is assumed) as a docker image.

## Why not use an app service plan or consumption model?
Mermaid uses Puppeteer, a headless Chromium tool, to render diagrams and export them. 

Azure Functions in App Service plans and cosnumption modesl have the following limitations:
- You have to deploy node_modules in your payload
  - relatively costly (time-wise) deploy model
  - since chromium is native, you have to build where you intend to run (win64, linux64, etc.)
- Windows plans fail to run Chromium, likely due to the isolation system
- Linux does not offer great support for adding extra dependencies needed such as libx11

## How does a function and docker work together?
Azure Functions is a run-time that consists of a .NET Core host and a set of worker run-times that can execute functions. 
With v2, the Function host run-time is freely available and NOT coupled to Azure at all. 
Microsoft also ships a base container image for this exact purpose.

## Building 
Building is really just building the docker image. The image has the necessary versions of node installed, so no other dependencies should be required.

## Hosting
You can host the container anywhere you want, but Kubernetes is considered first class and Azure Container Instances is incredibly easy and performant on 1vCore and 1.5gb ram requirements.

## Warnings
> Memory usage may build up over time, I haven't done too much testing at load, but simple use-cases
(embedding images in docs by URL) work great.

> Puppeteer has to be ran without a sandbox on docker, this means less security, so be cognizant of the trade-offs there and what 
level of content you send to a public instance.

> No input validation is currently done, this is a pretty big security concern since script injection attacks would be trivial. 
If you plan on making an instance public, definitely conder those ramifications and hopefully add validation first!
