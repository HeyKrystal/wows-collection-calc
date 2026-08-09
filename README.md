# World of Warships Collection Calc ⚓

The goal of this project was to provide players with a way to estimate how many containers they would need to complete a collection in World of Warships, along with the potential cost. This application uses a Monte Carlo simulation to produce a range of expected outcomes. It takes duplicates and their tokens into consideration with the simulation as well.

> [!NOTE]
> This calculator is intended as an estimation tool. Container drops are random, so your actual results may be better or worse than the estimate. The calculator intentionally presents a **50%--80% expected range**. The lower end represents a typical outcome (50% of players), while the upper end provides a conservative "heads up" for players end up being more unlucky.

## Features
-   [x] Searchable Collection Templates
-   [x] Manual Collection Configuration
-   [x] Completion Progress Agnostic
-   [x] Accounts For Duplicate Exchange
-   [x] Container Cost Calculations
-   [x] Best, Worst, Average, etc. Statistics
-   [ ] Asks RNGesus to be kind to you

## Quick Start
1.  Open the calculator [here](https://collections.krstldv.com/).
2.  Search for a known collection, or enter its size and duplicate rate manually.
3.  Enter the elements, collection tokens, and duplicate progress you already have.
4.  Set the container details and optional cost, then choose **Calculate Estimate**.
5.  Review the estimates for your container purchase forecasting.

## Usage
### Collection Name
A lookup for existing collection in game. 
### Collection Size
The total number of unique elements in the collection. 
### Duplicate Exchange Rate
The number of duplicate elements needed to earn a collection

### Elements Collected
The number of unique collection elements already owned.
### Collection Tokens
The number of collection tokens owned you have available.
### Duplicates Held
Your current duplicate progress toward your next collection token.

### Elements Per Container
How many collection elements each container awards. You will have to find this on the container details or on Wargaming's [Container Contents and Drop Chances](https://worldofwarships.asia/en/content/contents-and-drop-rates-of-containers/) page.
### Container Cost
Optional. If provided, the calculator will show the cost based off the range of container estimated.
### Container Cost
The currency the cost estimates will be presented in.

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

Collection information is automatically updated from the Wargaming API and is made available through the endpoints in the [wows-shared-data](https://github.com/HeyKrystal/wows-shared-data) repo.

No API key is required to use the calculator.

## Wargaming Assets

This application uses World of Warships game data and displays some Wargaming-owned artwork and icons.

World of Warships, related trademarks, and Wargaming-owned artwork remain the property of Wargaming. Those assets are **not covered by this repository's MIT license**. The MIT license applies only to the original code and other material I own.

This is an unofficial fan project and is not affiliated with, endorsed by, or supported by Wargaming.

Shared game data and static Wargaming artwork are maintained through the [wows-shared-data](https://github.com/HeyKrystal/wows-shared-data) repository.

## Issues
This is primarily a personal project. If there are obviously valid problems or issues with the calculations, feel free to open an issue and I will try my best to get to it.
However, requests that border enhancements or conveniences will be a stretch for me. I just don't have a lot of time for that.

## Contribution
I'm not super familiar with GitHub's collaboration features. I'll try to be accomodating where it makes sense though. If you're wanting to make edits for your own personal use feel free to fork the project and do whatever you'd like to it. 😊