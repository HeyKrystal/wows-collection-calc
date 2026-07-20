# World of Warships Collection Calc ⚓

The goal of this project was to provide players with a way to estimate how many containers they would need to complete a collections, along with the cost. This application uses a Monte Carlo simulation to produce a range of expected outcomes. It it takes duplicates and their tokens into consideration with the simulation as well.

> [!NOTE]
> This calculator is intended as an estimation tool. Container drops are random, so your actual results may be better or worse than the estimate. The calculator intentionally presents a **50%--80% expected range**. The lower end represents a typical outcome, while the upper end provides a conservative "heads up" for players end up being more unlucky.

## Features
-   [x] Searchable Collection Templates
-   [x] Manual Collection Configuration
-   [x] Completion Progress Agnostic
-   [x] Accounts For Duplicate Exchange
-   [x] Container Cost Calculations
-   [x] Best, Worst, Average, etc. Statistics
-   [ ] Asks RNGesus to be kind to you

## Quick Start
1.  Open the calculator [here](https://heykrystal.github.io/wows-collection-calc/).
2.  Enter your collection information.
3.  Click or tap **Calculate Estimate**.
4.  ???
5.  Review the estimates for your container purchase forcasting.

## Usage
### Collection Size
The total number of unique elements in the collection. 
### Elements Collected
The number of unique collection elements already owned.
### Collection Tokens
The number of collection tokens owned; those tokens recieved when enough duplicates are aquired.
### Duplicate Exchange Rate
The number of duplicate elements needed to earn a collection
token.
### Duplicates
Your current progress toward your next collection token.
### Elements Per Container
How many collection elements each container awards. You will have to find this on the container details or on Wargaming's [Container Contents and Drop Chances](https://worldofwarships.asia/en/content/contents-and-drop-rates-of-containers/) page.
### Container Cost
Optional. If provided, the calculator will show the cost based off the range of container estimated.

## How the Estimate Works
The calculator performs a large number of simulated collection completions using the collection details provided. Rather than immediately spending collection tokens, it assumes an optimal strategy where tokens are saved until enough have accumulated to complete the remaining collection.

The displayed **Expected Containers** range is based on the 50th and 80th percentiles of the simulation results, giving both a typical outcome (50%) and a conservative expectation (80%). This range should apply to most players, and is narrow enough to give a reasonable expectation.

## Examples
A very typical example for a brand new 16-element collection:

    Collection Size: 16
    Elements Collected: 0
    Collection Tokens: 0
    Duplicate Rate: 4
    Duplicates: 0
    Elements Per Container: 1

    

## Hosting
This project is a completely static HTML, CSS, and JavaScript application and can be hosted using GitHub Pages or any standard web server.
Collection dataset will change overtime and API access is required to keep those updated.

## Collection Metadata

Collection information is automatically updated from the Wargaming API.

A scheduled GitHub Action:
- Downloads collection metadata
- Counts collection elements
- Produces a minimal JSON file for the website
- Commits changes only when metadata has changed

No API key is required to use the calculator.

## Issues
This is primarily a personal project. If there are obviously valid problems or issues with the calculations, feel free to open an issue and I will try my best to get to it.
However, requests that border enhancements or conveniences will be a stretch for me. I just don't have a lot of time for that.

## Contribution
I'm not super familiar with GitHub's collaboration features. I'll try to be accomodating where it makes sense though. If you're wanting to make edits for your own personal use feel free to fork the project and do whatever you'd like to it. 😊
